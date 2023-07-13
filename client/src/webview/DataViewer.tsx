// Copyright © 2023, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import ".";

import { AgGridReact } from "ag-grid-react";
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import useDataViewer from "./useDataViewer";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DataViewer = () => {
  const { columns, onGridReady } = useDataViewer();
  const [theme] = React.useState(
    document.querySelector(".vscode-dark")
      ? "ag-theme-alpine-dark"
      : "ag-theme-alpine"
  );

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={`ag-grid-wrapper ${theme}`}
      style={{
        "--ag-borders": "none",
        "--ag-row-border-width": "0px",
        height: "100%",
        width: "100%",
      }}
    >
      <AgGridReact
        cacheBlockSize={100}
        columnDefs={columns}
        infiniteInitialRowCount={100}
        maxBlocksInCache={10}
        onGridReady={onGridReady}
        rowModelType="infinite"
      />
    </div>
  );
};

const root = ReactDOMClient.createRoot(document.querySelector(".data-viewer"));
root.render(<DataViewer />);
