import { QueryRowFormat } from "@itwin/core-common";
import { IModelConnection } from "@itwin/core-frontend";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { EmphasizeElements, IModelApp, ScreenViewport, ViewChangeOptions } from "@itwin/core-frontend";
let _applyEmphasize: Boolean = true;
let _colorsDictionary: Map<string, ColorDef> = new Map<string, ColorDef>([]);


export class SQLFunctions{

  public queryHeaders = async (imodel: IModelConnection, query: string) => {

    try {
      const queryresults = await  imodel.query(query, undefined, {rowFormat : QueryRowFormat.UseECSqlPropertyNames, limit: {count: 1}});
      const aQueryResult = await queryresults.next();
      // our headers are
      const headers = Object.keys(aQueryResult.value)
      return headers;
    }
    catch(e : any) {
      console.log(e.message as Error)
      return [];
    }
  };
  
  
  public executeQuery = async (imodel: IModelConnection, query: string) => {
    const rows = [];
    try {
  
      for await (const row of imodel.query(query, undefined, {rowFormat : QueryRowFormat.UseECSqlPropertyNames}))
        rows.push(row);
  
      return rows;
    }
    catch(e : any) {
      console.log(e.message as Error)
      return rows;
    }
  };
}
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/


export const visualizeElements = async (elements: { [key: string]: string }) => {
    if (!_applyEmphasize)
        return;

    if (!IModelApp.viewManager.selectedView)
        return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    clearEmphasizeElements(vp, emph)

    const elementsIds = Object.keys(elements);
    for (const elementId of elementsIds)
      emph.overrideElements(elementId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, false);

emphasizeElements(vp, emph, elementsIds)
zoomElements(vp, elementsIds);
}

export const visualizeElementsByLabel = async (elementsIds: string[], label: string) => {
    if (!_applyEmphasize)
        return;

    if (!IModelApp.viewManager.selectedView)
        return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    clearEmphasizeElements(vp, emph)

    for (const elementId of elementsIds)
        emph.overrideElements(elementId, vp, getLabelColor(label), FeatureOverrideType.ColorOnly, false);

    emphasizeElements(vp, emph, elementsIds)
    zoomElements(vp, elementsIds);
}

export const getLabelColor = (label: string) => {
    if (_colorsDictionary.has(label))
        return _colorsDictionary.get(label) ?? ColorDef.black;

    let newColor = generateRandomColor();
    _colorsDictionary.set(label, newColor);
    return newColor;
}

export const emphasizeMisclassifiedElements = (misclassifiedElements: string[]) => {
    if (!IModelApp.viewManager.selectedView)
        return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    clearEmphasizeElements(vp, emph)
    emphasizeElements(vp, emph, misclassifiedElements)
}

export const clearMisclassifiedEmphasizeElements = () => {
    if (!IModelApp.viewManager.selectedView)
        return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    clearEmphasizeElements(vp, emph)
}

export const setEmphasisMode = (enabled: Boolean = true) => {
    _applyEmphasize = enabled;
}

const generateRandomColor = (): ColorDef => {
    return ColorDef.from(getRandomInt(), getRandomInt(), getRandomInt());
}

const getRandomInt = () : number => {
	let min = 0;
	let max = 225;
	return Math.floor(Math.random() * (max - min + 1)) + min; 
}

const clearEmphasizeElements = (vp: ScreenViewport, emph: EmphasizeElements) => {
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
}

const emphasizeElements = (vp: ScreenViewport, emph: EmphasizeElements, elementsIds: string[]) => {
    emph.wantEmphasis = true;
    emph.emphasizeElements(elementsIds, vp, undefined, false);
}

const zoomElements = (vp: ScreenViewport, elementsIds: string[]) => {
    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    // viewChangeOpts.marginPercent = new MarginPercent(0.25, 0.25, 0.25, 0.25);
    vp.zoomToElements(elementsIds, { ...viewChangeOpts })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
        });
}
