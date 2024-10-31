import { SPFI } from "@pnp/sp";

// Interface for Customer data
export interface ICustomer {
  CustomerName: string;
  StreetAddress: string;
  Suburb: string;
  City: string;
  Pin: string;  // PostalCode
  Email: string;
  Phone: string;
  Status: string;
}

// Function to check if customer exists and create if not
export const manageCustomer = async (sp: SPFI, customerData: ICustomer,customerListName:string): Promise<void> => {
  try {
    // Check if customer exists by email
    const existingCustomers = await sp.web.lists
      .getByTitle("Customer")
      .items
      .filter(`Email eq '${customerData.Email}'`)();

    // If customer doesn't exist, create new customer
    if (existingCustomers.length === 0) {
      await sp.web.lists
        .getByTitle(customerListName)
        .items
        .add({
          Title: customerData.CustomerName,
          Address: customerData.StreetAddress,
          Suburb: customerData.Suburb,
          City: customerData.City,
          Pin: customerData.Pin,
          Email: customerData.Email,
          Phone: customerData.Phone,
          Status: 'Active'
        });
      
      console.log('New customer created:', customerData.CustomerName);
    } else {
      console.log('Customer already exists:', customerData.CustomerName);
    }
  } catch (error) {
    console.error('Error managing customer:', error);
    throw error;
  }
};