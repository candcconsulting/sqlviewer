/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table , tableFilters } from "@itwin/itwinui-react"
import { Spinner, SpinnerSize,  } from "@itwin/core-react";
import { visualizeElements} from "../helper/sqlfunctions"


interface headersInterface {
  id : string,
  Header : string,
  accessor : string,
  sortable : boolean,
  width: number
}

interface resultsInterface {
  tableContents?: any[],
  tableColumns?: any[],
  children? : React.ReactNode
}


export const ResultsTableWidget = ({tableContents, tableColumns} : resultsInterface) => {
  
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [filteredData, setfilteredData] = useState([]);
  const [headers, setHeaders] = useState<any>();
  console.count('Results Table')
  console.time("Table Widget")

  useEffect(() => {
    if (loaded && (data.length != tableContents?.length))
      setLoaded(false);
  }, [loaded, data, tableContents])

  useEffect(() => {
    if (!loaded) {
      if (tableContents) {
        const stringifiedData: Record<string, any>[] = []
        tableContents.map((item) => {
          let stringified: Record<string, any> = {};
          for (const [key, value] of Object.entries(item)) {
            if (key.toLowerCase() === "ecinstanceid") {
              stringified[key.toLowerCase()] = value;
            } else
            {
              stringified[key.toLowerCase()] = JSON.stringify(value);
            }
          }
          stringifiedData.push(stringified)
        });
        setData(stringifiedData);
      }

      if (tableColumns) {
        const columns: headersInterface[] = [];
        for (let i = 0; i < tableColumns.length; i++) {
          if(tableColumns[i] === "GeometryStream")
            continue;

          const columnKey = "column" + i;
          const columnWidth = tableColumns[i].length * 20;
          columns.push({ id: columnKey, Header: tableColumns[i], accessor: tableColumns[i].toLowerCase(), sortable: true, width: columnWidth });
        }
        setHeaders([{ Header: 'Results', columns }])
      }
      setLoaded(true)
    }
  }, [loaded, tableColumns, tableContents])

  const onRowSelected = async (selectedData: any[] | undefined, tableState?: unknown | undefined) =>  {
    const elements: { [key: string]: string } = {};

    if (!selectedData)
      return;    
    console.log(`Selected rows: ${JSON.stringify(selectedData)}, Table state: ${JSON.stringify(tableState)}`)
    for await (const rowItem of selectedData) {
      console.log(rowItem);
      const ecInstanceId =  rowItem.ecinstanceid;
      elements[ecInstanceId] = ecInstanceId;
    }
    visualizeElements(elements)

  }

  // filters table data when slider value changes

  return (
    <div>
      {!loaded ? <div><Spinner size={SpinnerSize.Small} /> Loading ...</div> :
        <div className="full-height">
          <Table
            columns={headers}
            data={data}            
            selectionMode={"multi"}   
            isSortable={true}
            isSelectable={true}
            isResizable={true}
            emptyTableContent="No data"    
            onSelect={onRowSelected}            
            style = {{display: "flex", scrollBehavior : "auto", flexDirection: "column", justifyContent: "flex-end"}}       
          />
        </div>
      }
    </div>
  );
};


