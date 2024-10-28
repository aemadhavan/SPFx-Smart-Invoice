import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  //PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import * as strings from 'InvoiceHubWebPartStrings';
import { InvoiceHub } from './components/InvoiceHub';
import { IInvoiceHubProps } from './components/IInvoiceHubProps';

export interface IInvoiceHubWebPartProps {
  listName: string;
  libraryName: string;
}

export default class InvoiceHubWebPart extends BaseClientSideWebPart<IInvoiceHubWebPartProps> {
  private _sp: SPFI;
  
  public render(): void {
    const element: React.ReactElement<IInvoiceHubProps> = React.createElement(
      InvoiceHub,
      {
        listName: this.properties.listName,
        sp: this._sp,
        context: this.context,
        libraryName: this.properties.libraryName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._sp = spfi().using(SPFx(this.context));
    
  }



 
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    } 

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.ListName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel
                }),
                PropertyPaneTextField('libraryName', {
                  label: 'Document Library Name'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
