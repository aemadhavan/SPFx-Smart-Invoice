import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI } from "@pnp/sp";

export interface IInvoiceHubProps {
  listName: string;
  libraryName: string;
  sp: SPFI;
  context: WebPartContext;
  
}
