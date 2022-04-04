import React from 'react';
import { Button } from "bootstrap";
import { Column } from "react-base-table";

const ISSUE_COLUMN = [
  {
    key: "title",
    title: "Title",
    dataKey: "title",
    width: 150,
    resizable: true,
    sortable: true,
    align: Column.Alignment.CENTER,
  },
  {
    key: "priority",
    title: "Priority",
    dataKey: "priority",
    width: 300,
    resizable: true,
    sortable: true,
    align: Column.Alignment.CENTER,
  },
  {
    key: "label",
    title: "Label",
    dataKey: "label",
    width: 300,
    resizable: true,
    sortable: true,
    align: Column.Alignment.CENTER,
  },
  {
    key: "action",
    title: "Action",
    dataKey: "action",
    width: 120,
    resizable: false,
    sortable: false,
    align: Column.Alignment.RIGHT,
    frozen: Column.FrozenDirection.RIGHT,
  },
]

export default ISSUE_COLUMN;
