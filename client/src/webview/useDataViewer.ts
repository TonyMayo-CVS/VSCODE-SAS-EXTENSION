// Copyright © 2023, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GridReadyEvent, IGetRowsParams } from "ag-grid-community";
import { useCallback, useEffect, useState } from "react";
import { TableData } from "../components/LibraryNavigator/types";

declare const acquireVsCodeApi;
export const vscode = acquireVsCodeApi();

const contextMenuHandler = (e) => {
  e.stopImmediatePropagation();
};

const queryTableTimeout = 60 * 1000; // 60 seconds (accounting for compute session expiration)
let queryTableDataTimeoutId = null;
const clearQueryTimeout = () =>
  queryTableDataTimeoutId && clearTimeout(queryTableDataTimeoutId);

export const queryTableData = (
  start: number,
  end: number
): Promise<TableData> => {
  vscode.postMessage({
    command: "request:loadData",
    data: { start, end },
  });

  return new Promise((resolve, reject) => {
    const commandHandler = (event) => {
      const { data } = event.data;
      if (event.data.command === "response:loadData") {
        window.removeEventListener("message", commandHandler);
        clearQueryTimeout();
        resolve(data);
      }
    };

    clearQueryTimeout();
    queryTableDataTimeoutId = setTimeout(() => {
      window.removeEventListener("message", commandHandler);
      reject(new Error("Timeout exceeded"));
    }, queryTableTimeout);

    window.addEventListener("message", commandHandler);
  });
};

const useDataViewer = () => {
  const [columns, setColumns] = useState([]);

  const onGridReady = useCallback((event: GridReadyEvent) => {
    const dataSource = {
      rowCount: undefined,
      getRows: (params: IGetRowsParams) => {
        queryTableData(params.startRow, params.endRow).then(
          ({ rows, headers, count }: TableData) => {
            const rowData = rows.map(({ cells }) =>
              cells.reduce(
                (carry, cell, index) => ({
                  ...carry,
                  [headers.columns[index]]: cell,
                }),
                {}
              )
            );

            params.successCallback(rowData, count);
          }
        );
      },
    };

    event.api.setDatasource(dataSource);
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      return;
    }

    queryTableData(0, 100).then((data: TableData) => {
      setColumns(
        (data.headers.columns || []).map((field) => ({
          field,
        }))
      );
    });
  }, [columns.length]);

  useEffect(() => {
    window.addEventListener("contextmenu", contextMenuHandler, true);

    return () => {
      window.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, []);

  return { columns, onGridReady };
};

export default useDataViewer;
