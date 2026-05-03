const BASE_URL = 'http://localhost:5000'; 

export const AdminAPI = {
    // Add a new dish to the menu
    addMenuItem: async (restaurantId, itemData) => {
        try {
            const response = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            return response.ok;
        } catch (error) {
            console.error("Error adding item:", error);
            return false;
        }
    },

    // Delete a dish from the menu
    deleteMenuItem: async (restaurantId, itemName) => {
        try {
            const response = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}/menu/${encodeURIComponent(itemName)}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error("Error deleting item:", error);
            return false;
        }
    },

    /**
     * UNIVERSAL UPDATE: Can update name, price, description, or image
     */
    updateMenuItem: async (restaurantId, oldItemName, updatedData) => {
        try {
            const response = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}/menu/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    oldItemName: oldItemName, 
                    updatedData: updatedData 
                })
            });
            return response.ok;
        } catch (error) {
            console.error("Error updating item:", error);
            return false;
        }
    }
};