import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  getDocs,
  where,
  setDoc,
  deleteField
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const SALES_COLLECTION = 'sales';
const MONEY_TRANSACTIONS_COLLECTION = 'moneyTransactions';

export const dbService = {
  // Subscribe to all products (real-time)
  subscribeToInventory: (callback, errorCallback) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const inventory = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(inventory);
    }, errorCallback);
  },

  // Subscribe to all sales (real-time)
  subscribeToSales: (callback, errorCallback) => {
    const q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(sales);
    }, errorCallback);
  },

  // Subscribe to money transactions
  subscribeToMoneyTransactions: (callback, errorCallback) => {
    const q = query(collection(db, MONEY_TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    }, errorCallback);
  },

  // Add a new product
  addProduct: async (productData) => {
    const isSold = !!productData.soldPrice;
    
    const newProduct = {
      ...productData,
      status: isSold ? 'Sold' : 'In Stock',
      createdAt: new Date().toISOString() // Fallback for easier client parsing, or use serverTimestamp()
    };

    if (isSold) {
      newProduct.soldDate = new Date().toISOString();
    }

    try {
      if (isSold) {
        // If it's added as sold, we need a batch to add to products AND sales
        const batch = writeBatch(db);
        
        const productRef = doc(collection(db, PRODUCTS_COLLECTION));
        batch.set(productRef, newProduct);

        const saleRef = doc(collection(db, SALES_COLLECTION));
        const profit = Number(productData.soldPrice) - Number(productData.purchasePrice);
        
        const saleData = {
          productId: productRef.id,
          imeiNumber: productData.imei,
          modelName: productData.modelName,
          brandName: productData.brand,
          purchasePrice: productData.purchasePrice,
          soldPrice: productData.soldPrice,
          profit,
          customerName: productData.customerName || '',
          customerPhone: productData.customerPhone || '',
          soldDate: newProduct.soldDate,
          createdAt: newProduct.soldDate,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          paymentMethod: productData.paymentMethod || 'Cash'
        };
        batch.set(saleRef, saleData);

        await batch.commit();
      } else {
        // Just add to products
        await addDoc(collection(db, PRODUCTS_COLLECTION), newProduct);
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id, updatedFields) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    let status = updatedFields.status;
    
    if (!status) {
      if (updatedFields.soldPrice) status = 'Sold';
      else if (updatedFields.quantity < 5) status = 'Low Stock';
      else status = 'In Stock';
    }

    const batch = writeBatch(db);

    batch.update(productRef, {
      ...updatedFields,
      status,
      updatedAt: new Date().toISOString()
    });

    if (status === 'Sold' || updatedFields.status === 'Sold') {
      const q = query(collection(db, SALES_COLLECTION), where("productId", "==", id));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(saleDoc => {
        const saleData = saleDoc.data();
        const newPurchasePrice = updatedFields.purchasePrice !== undefined ? updatedFields.purchasePrice : saleData.purchasePrice;
        const profit = Number(saleData.soldPrice) - Number(newPurchasePrice);

        batch.update(saleDoc.ref, {
          imeiNumber: updatedFields.imei !== undefined ? updatedFields.imei : saleData.imeiNumber,
          modelName: updatedFields.modelName !== undefined ? updatedFields.modelName : saleData.modelName,
          brandName: updatedFields.brand !== undefined ? updatedFields.brand : saleData.brandName,
          purchasePrice: newPurchasePrice,
          profit: profit
        });
      });
    }

    await batch.commit();
  },

  // Delete a product
  deleteProduct: async (id) => {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  },

  // Mark a product as sold (Batch operation to update product and add sale)
  markAsSold: async (product, soldDetails) => {
    const batch = writeBatch(db);
    
    // 1. Update product status
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const soldDate = soldDetails.soldDate || new Date().toISOString();
    
    batch.update(productRef, {
      status: 'Sold',
      soldPrice: soldDetails.soldPrice,
      customerName: soldDetails.customerName || '',
      customerPhone: soldDetails.customerPhone || '',
      soldDate: soldDate,
      updatedAt: new Date().toISOString()
    });

    // 2. Add entry to sales collection
    const saleRef = doc(collection(db, SALES_COLLECTION));
    const profit = Number(soldDetails.soldPrice) - Number(product.purchasePrice);
    
    const saleData = {
      productId: product.id,
      imeiNumber: product.imei,
      modelName: product.modelName,
      brandName: product.brand,
      purchasePrice: product.purchasePrice,
      soldPrice: soldDetails.soldPrice,
      profit,
      customerName: soldDetails.customerName || '',
      customerPhone: soldDetails.customerPhone || '',
      soldDate: soldDate,
      createdAt: new Date().toISOString(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      paymentMethod: soldDetails.paymentMethod || 'Cash'
    };
    
    batch.set(saleRef, saleData);

    await batch.commit();
  },

  // Delete a sale and revert product status
  deleteSale: async (saleId, productId) => {
    const batch = writeBatch(db);
    
    // 1. Delete the sale entry
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    batch.delete(saleRef);

    // 2. Revert the product status
    if (productId) {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      batch.update(productRef, {
        status: 'In Stock',
        soldPrice: deleteField(),
        soldDate: deleteField(),
        customerName: deleteField(),
        customerPhone: deleteField(),
        updatedAt: new Date().toISOString()
      });
    }

    await batch.commit();
  },

  // Check if IMEI exists
  checkImeiExists: async (imei) => {
    const q = query(collection(db, PRODUCTS_COLLECTION), where("imei", "==", imei));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  // Add Money Transaction
  addMoneyTransaction: async (data) => {
    const amountGiven = Number(data.amountGiven || 0);
    const amountPaid = Number(data.amountPaid || 0);
    const remainingAmount = amountGiven - amountPaid;
    
    let status = 'Pending';
    if (remainingAmount <= 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';

    const newTx = {
      ...data,
      amountGiven,
      amountPaid,
      remainingAmount,
      status,
      paymentHistory: data.paymentHistory || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, MONEY_TRANSACTIONS_COLLECTION), newTx);
  },

  // Update Money Transaction
  updateMoneyTransaction: async (id, updatedFields) => {
    const txRef = doc(db, MONEY_TRANSACTIONS_COLLECTION, id);
    
    const amountGiven = Number(updatedFields.amountGiven || 0);
    const amountPaid = Number(updatedFields.amountPaid || 0);
    const remainingAmount = amountGiven - amountPaid;
    
    let status = 'Pending';
    if (remainingAmount <= 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';

    await updateDoc(txRef, {
      ...updatedFields,
      amountGiven,
      amountPaid,
      remainingAmount,
      status,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete Money Transaction
  deleteMoneyTransaction: async (id) => {
    const txRef = doc(db, MONEY_TRANSACTIONS_COLLECTION, id);
    await deleteDoc(txRef);
  },

  // Clear all data from all collections
  clearAllData: async () => {
    const productsSnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const salesSnapshot = await getDocs(collection(db, SALES_COLLECTION));
    const txSnapshot = await getDocs(collection(db, MONEY_TRANSACTIONS_COLLECTION));

    const backup = {
      products: productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
      sales: salesSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
      moneyTransactions: txSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    };

    const deletePromises = [];
    productsSnapshot.forEach(d => deletePromises.push(deleteDoc(d.ref)));
    salesSnapshot.forEach(d => deletePromises.push(deleteDoc(d.ref)));
    txSnapshot.forEach(d => deletePromises.push(deleteDoc(d.ref)));

    await Promise.all(deletePromises);
    return backup;
  },

  // Restore data from backup
  restoreData: async (backup) => {
    const restorePromises = [];
    
    if (backup.products) {
      backup.products.forEach(item => {
        const { id, ...data } = item;
        restorePromises.push(setDoc(doc(db, PRODUCTS_COLLECTION, id), data));
      });
    }
    
    if (backup.sales) {
      backup.sales.forEach(item => {
        const { id, ...data } = item;
        restorePromises.push(setDoc(doc(db, SALES_COLLECTION, id), data));
      });
    }
    
    if (backup.moneyTransactions) {
      backup.moneyTransactions.forEach(item => {
        const { id, ...data } = item;
        restorePromises.push(setDoc(doc(db, MONEY_TRANSACTIONS_COLLECTION, id), data));
      });
    }

    await Promise.all(restorePromises);
  }
};
