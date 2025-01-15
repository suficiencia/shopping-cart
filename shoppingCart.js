class ShoppingCart {
    constructor(productCatalog, pricingRules, promoCodes) {
        this.productCatalog = productCatalog; // Product details
        this.pricingRules = pricingRules; // General pricing rules
        this.promoCodes = promoCodes; // Promo code discounts
        this.cartItems = [];
        this.promoCode = null;
    }

    // Add an item to the cart
    add(itemCode, promoCode = null) {
        const product = Object.values(this.productCatalog).find(p => p.code === itemCode);
        if (!product) {
            throw new Error(`Product with code "${itemCode}" does not exist.`);
        }
        this.cartItems.push(itemCode);
        if (promoCode) {
            this.promoCode = promoCode;
        }
    }

    // Calculate total price
    total() {
        let totalPrice = 0;

        // Group items by name
        const groupedItems = {};
        for (const item of this.cartItems) {
            if (!groupedItems[item]) {
                groupedItems[item] = 0;
            }
            groupedItems[item]++;
        }

        // Calculate total price with rules
        for (const [itemCode, quantity] of Object.entries(groupedItems)) {
            const product = Object.values(this.productCatalog).find(p => p.code === itemCode);
            const itemPrice = product?.price || 0;
            let itemTotal = itemPrice * quantity;

            // Apply rules for the product
            for (const rule of this.pricingRules) {
                if (rule.applicableTo.includes(itemCode)) {
                    switch (rule.type) {
                        case 'buyXGetFreeY':
                            if (quantity >= rule.x) {
                                // Calculate how many full sets of X items
                                const fullSets = Math.floor(quantity / rule.x);
                                // Deduct the price of 1 item for each full set
                                itemTotal -= itemPrice * fullSets;
                            }
                            break;
                        case 'bulkDiscount':
                            if (quantity >= rule.bulkQuantity) {
                                itemTotal = rule.bulkPrice * quantity;
                            }
                            break;
                        case 'freeItem':
                            const freeItemsCount = groupedItems[itemCode] || 0;
                            for (let i = 0; i < freeItemsCount; i++) {
                                this.cartItems.push(rule.freeItem);
                            }
                            break;
                    }
                }
            }

            totalPrice += itemTotal;
        }

        // Apply promo code discount
        if (this.promoCode && this.promoCodes[this.promoCode]) {
            const discountPercentage = this.promoCodes[this.promoCode];
            totalPrice *= (1 - discountPercentage / 100);
        }

        return totalPrice.toFixed(2);
    }

    // List all items in the cart with product names
    items() {
        return this.cartItems.map(itemCode => {
            const product = Object.values(this.productCatalog).find(p => p.code === itemCode);
            return product ? product.name : itemCode;
        });
    }

    // Get final cart items grouped by product name
    generateFinalCart() {
        const groupedItems = {};

        for (const itemCode of this.cartItems) {
            const product = Object.values(this.productCatalog).find(p => p.code === itemCode);
            const productName = product ? product.name : itemCode;
            if (!groupedItems[productName]) {
                groupedItems[productName] = 0;
            }
            groupedItems[productName]++;
        }

        // Format the grouped items
        return Object.entries(groupedItems).map(
            ([name, quantity]) => `${quantity} x ${name}`
        );
    }

    // Update the pricing rule by type and index
    updatePricingRule(ruleIndex, newDetails) {
        if (ruleIndex >= 0 && ruleIndex < this.pricingRules.length) {
            this.pricingRules[ruleIndex] = { ...this.pricingRules[ruleIndex], ...newDetails };
        } else {
            console.error('Invalid pricing rule index.');
        }
    }

    // Update the price of a product in the catalog
    updateProductPrice(productKey, newPrice) {
        const product = this.productCatalog[productKey];
        if (product) {
            product.price = newPrice;
        } else {
            console.error('Product not found in catalog.');
        }
    }
}

// Product Catalog: Core product details
const ProductCatalog = {
    SMALL: { code: 'ult_small', name: 'Unlimited 1GB', price: 24.90 },
    MEDIUM: { code: 'ult_medium', name: 'Unlimited 2GB', price: 29.90 },
    LARGE: { code: 'ult_large', name: 'Unlimited 5GB', price: 44.90 },
    ONE_GB: { code: '1gb', name: '1GB Data-pack', price: 9.90 },
};

// General Pricing Rules
const pricingRules = [
    {
        type: 'buyXGetFreeY',
        applicableTo: ['ult_small', 'ult_medium'], // Products this rule applies to
        x: 3, // Buy 3
        y: 1, // Get 1 free
    },
    {
        type: 'bulkDiscount',
        applicableTo: ['ult_large'], // Products this rule applies to
        bulkQuantity: 3,
        bulkPrice: 39.90,
    },
    {
        type: 'freeItem',
        applicableTo: ['ult_medium'], // Products this rule applies to
        freeItem: '1gb',
    },
];

// Promo Codes Configuration:
// Available promo codes and their associated discount percentages.
const promoCodes = {
    'I<3AMAYSIM': 10, // 10% discount
    'SAMPLE_DISCOUNT20': 20, // 20% discount
};

// Test Scenarios
const runScenarios = () => {
    const scenarios = [
        { items: ['ult_small', 'ult_small', 'ult_small', 'ult_large'], promoCode: null },
        { items: ['ult_small', 'ult_small', 'ult_large', 'ult_large', 'ult_large', 'ult_large'], promoCode: null },
        { items: ['ult_small', 'ult_medium', 'ult_medium'], promoCode: null },
        { items: ['ult_small', '1gb'], promoCode: 'I<3AMAYSIM' },
    ];

    scenarios.forEach((scenario, index) => {
        const cart = new ShoppingCart(ProductCatalog, pricingRules, promoCodes);
        scenario.items.forEach(item => cart.add(item, scenario.promoCode));
        console.log(`Scenario ${index + 1}`);
        console.log('Cart Items:', cart.items());
        console.log('Cart Total Price: $', cart.total());
        console.log('Final Cart Summary (After Offers):', cart.generateFinalCart())
        console.log('----------------------');
    });

    // Test to demonstrates dynamic updates to product prices and pricing rules.
    // Simulates a shop owner's ability to modify rules
    console.log('=================== Modified pricing rules and product price ======================= ')

    const otherScenarios = [
        { items: ['ult_small', 'ult_small', 'ult_small', 'ult_small', 'ult_medium', 'ult_medium', 'ult_medium', 'ult_medium'], promoCode: null },
        { items: ['ult_large', 'ult_large', 'ult_large', 'ult_large', 'ult_large', 'ult_small', 'ult_medium'], promoCode: null },
        { items: ['ult_small', 'ult_medium', '1gb'], promoCode: 'SAMPLE_DISCOUNT20' },
    ];

    otherScenarios.forEach((scenario, index) => {
        const cart = new ShoppingCart(ProductCatalog, pricingRules, promoCodes);

        // Update the "buy 3, get 1 free" rule for 'ult_small' to "buy 2, get 1 free"
        cart.updatePricingRule(0, { x: 2, y: 1 });

        // Update the bulk discount rule for 'ult_large'
        cart.updatePricingRule(1, { bulkQuantity: 5, bulkPrice: 40.90 });

        // Update the price for 'ult_small'
        cart.updateProductPrice('SMALL', 25);

        // Update applicableTo for the buyXGetFreeY rule.
        pricingRules[0].applicableTo = ['ult_small', 'ult_medium'];

        scenario.items.forEach(item => cart.add(item, scenario.promoCode));
        console.log(`Scenario ${index + 5}`);
        console.log('Cart Items:', cart.items());
        console.log('Cart Total Price: $', cart.total());
        console.log('Final Cart Summary (After Offers):', cart.generateFinalCart())
        console.log('----------------------');
    });

};

// Run the scenarios
runScenarios();
