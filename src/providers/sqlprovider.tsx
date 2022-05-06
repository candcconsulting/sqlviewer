import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@itwin/appui-abstract";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { EmphasizeElements, IModelApp, IModelConnection } from "@itwin/core-frontend";
import { Blockquote, Button, Input, Textarea, Text } from "@itwin/itwinui-react";
import { AST, Parser } from "node-sql-parser";

const _executeQuery = async (imodel: IModelConnection, query: string) => {
  const rows = [];
  for await (const row of imodel.query(query))
    rows.push(row);

  return rows;
};


const SQLWidget = () => {
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
  }

  async function handleExecuteSQL() : Promise<void> {
    const input = document.getElementById('sqlStatement') as HTMLInputElement;
    if (input) {
      const sql =  input.value
      const parser = new Parser();
      const ast = parser.astify(sql) as AST
      if ((ast.type === "select") && ((ast.columns.indexOf("*") >= 0) || (ast.columns.indexOf("ecinstanceid") >= 0)) && (ast.where)) {
        const vp = IModelApp.viewManager.getFirstOpenView();
        if (!vp) { return};
        const authClient = IModelApp.authorizationClient as BrowserAuthorizationClient
        const iModelId = vp.iModel
        if (authClient && iModelId) {
          const para = document.getElementById("resultsOutput")
          if (para)
            para.innerHTML = "Awaiting Results";
          const results = await _executeQuery(vp.iModel, sql)
          if (para)
            para.innerHTML = results.length + " results displayed"
          const emph = EmphasizeElements.getOrCreate(vp);            
          emph.clearEmphasizedElements(vp);
          emph.clearOverriddenElements(vp);            
          const ecResult = results.map(x => x[0]);            
          emph.emphasizeElements(ecResult,vp, undefined, false);

        }
      } else
      {
        const para = document.getElementById("resultsOutput")
        if (para)
          para.innerHTML = "Query must be a SELECT statement, must have an ecInstanceId and must have a WHERE clause";

      }
  
    }
  }
  return (
    <span>
      <span>SQL Visualiser</span> <br></br>
      <Button onClick={ () => handleExecuteSQL() }>Execute SQL</Button> <Button onClick = { () => handleClear()}>Clear Results</Button>
      <br></br>
      <Textarea placeholder='Enter ecSQL statement' id = "sqlStatement"   ></Textarea>
      <br></br>
      <Text id="resultsOutput">Waiting SQL</Text>
      <Blockquote>Enter an ecSQL statement that returns an ecInstance you can use JOIN and WHERE, but the first property must be an ecInstanceId relating to geometry </Blockquote>
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
      location === StagePanelLocation.Right &&
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