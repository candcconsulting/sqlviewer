import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-abstract";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { ColorDef } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, IModelConnection, NotifyMessageDetails, OutputMessagePriority } from "@itwin/core-frontend";
import { Blockquote, Button, Textarea, Text, toaster  } from "@itwin/itwinui-react";
import { KeySet } from "@itwin/presentation-common";
import { HiliteSetProvider } from "@itwin/presentation-frontend";
import { AST, Parser } from "node-sql-parser";
import { useState } from "react";
import { SQLFunctions } from "../helper/sqlfunctions"
import { ResultsTableWidget } from "./resultsProvider"


import './sqlprovider.css'


const displayWarningToast = (message: string) => {
  toaster.setSettings({
    placement: "top-end",
    order: "descending",
  });

  toaster.warning(message, {
    duration: 3000,
  });
};

const SQLWidget = () => {
  const [results, setResults] = useState<any[]>();
  const [columns, setColumns] = useState<any[]>();

  async function handleClear() : Promise<void> {
    const vp = IModelApp.viewManager.getFirstOpenView();
    if (!vp) { return};
    const authClient = IModelApp.authorizationClient as BrowserAuthorizationClient
    const iModelId = vp.iModel
    if (authClient && iModelId) {
      const para = document.getElementById("resultsOutput")
      if (para)
        para.innerHTML = "Results Cleared";
      const emph = EmphasizeElements.getOrCreate(vp);            
      emph.clearEmphasizedElements(vp);
      emph.clearOverriddenElements(vp);            

    }
    setResults([]);
    setColumns([]);
  }

  const getElementIdHiliteSet = async function(elementIds: string[], iModel: IModelConnection) {
    if(iModel.isOpen) {
      const provider = HiliteSetProvider.create({imodel: iModel});
      const keys = elementIds.map(function(id: any){
        return {id, className: "BisCore:GeometricElement"};
      });
      let keyset = new KeySet(keys);
      const set = await provider.getHiliteSet(keyset);
      if (set.elements === undefined)
        return [];
      return [...set.elements, ...elementIds];
    }
    return []
  }

  async function handleExecuteSQL() : Promise<void> {
    const input = document.getElementById('sqlStatement') as HTMLInputElement;
    if (input) {
      const sql =  input.value;
      const parser = new Parser();
      try {
        const ast = parser.astify(sql) as AST;
        if ((ast.type !== "select")) {          
            const para = document.getElementById("resultsOutput");
            if (para)
              para.innerHTML = "Query must be a SELECT statement, must have an ecInstanceId and must have a WHERE clause";
            return;
        }
      }
      catch (e) {
        const error = e as Error;
        IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Warning, "Query syntax failed" + error.message));
      }
      const vp = IModelApp.viewManager.getFirstOpenView();
      if (!vp) { return};
      const authClient = IModelApp.authorizationClient as BrowserAuthorizationClient;
      const iModelId = vp.iModel;
      if (authClient && iModelId) {
        const para = document.getElementById("resultsOutput");
        let queryResults : any[] = [];
        if (para) {
          para.innerHTML = "Awaiting Results";
          const sqlAPI = new SQLFunctions();
          const queryColumns = await sqlAPI.queryHeaders(vp.iModel, sql);
          queryResults = await sqlAPI.executeQuery(vp.iModel, sql);
          para.innerHTML = queryResults.length + " results displayed";
          setColumns(queryColumns);
          setResults(queryResults);
/*          
          const emph = EmphasizeElements.getOrCreate(vp);            
          emph.clearEmphasizedElements(vp);
          emph.clearOverriddenElements(vp);            
          const ecResult = queryResults!.map(x => x["ecInstanceId"]);
          // const allElements = ecResult;
          const allElements = await getElementIdHiliteSet(ecResult, vp.iModel);
//          emph.overrideElements(allElements, vp, ColorDef.green, FeatureOverrideType.ColorOnly, false);
          for (const elementKey in allElements) {
            emph.overrideElements(elementKey, vp, ColorDef.red);
            // emph.overrideElements(elementKey, vp, ColorDef.green, FeatureOverrideType.ColorOnly, false);
          
          }
//          emph.emphasizeElements(allElements, vp, undefined, false)
          vp.zoomToElements(allElements);
          vp.iModel.selectionSet.emptyAll();
          for (const es of allElements.values()) {
            vp.iModel.selectionSet.add(es);
          }
*/            
        } // if (para)
      }
          
    }
  }
  return (
    <span>
      <div className="row">
        <div className="column left">
          <span>SQL Visualiser</span> <br></br>
          <Button onClick={ () => handleExecuteSQL() }>Execute SQL</Button> <Button onClick = { () => handleClear()}>Clear Results</Button>
          <br></br>
          <Textarea placeholder='Enter ecSQL statement' id = "sqlStatement"   ></Textarea>
          <br></br>
          <Text id="resultsOutput">Waiting SQL</Text>
          <Blockquote>Enter an ecSQL statement that returns an ecInstance you can use JOIN and WHERE, but the first property must be an ecInstanceId relating to geometry </Blockquote>
        </div>
        <div className="column right">
          {!results ?
            <Blockquote>Awaiting table</Blockquote>
          :
            <ResultsTableWidget tableContents = {results} tableColumns = {columns}/>
          }
        </div>
      </div>
    </span>
  )
}

export class sqlUIProvider implements UiItemsProvider {
  public readonly id = 'sqlUIProviderId';


  public provideWidgets(
    stageId: string,
    stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection,
    ): ReadonlyArray<AbstractWidgetProps> {
  
    const widgets: AbstractWidgetProps[] = [];

    if (
      location === StagePanelLocation.Bottom &&
      section === StagePanelSection.Start
    ) {
/*      const itwinui_react_1 = require("@itwin/itwinui-react");
      const react_1 = react;
      const mappings = displayMappingValues();
*/

      const widget: AbstractWidgetProps = {
        id: 'SQLUI',
        label: 'SQL Visualisation',
        getWidgetContent: () => <SQLWidget />
        
        }
      ;
      widgets.push(widget);
    }

    return widgets;
  }
}
export {}