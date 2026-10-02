import { STATUSES, CATEGORIES } from "./assets";
import { DEPARTMENTS } from "./employees";

// filter type: "select" (default) or "date"
// column type: "date", "number", or plain text (default)
export const REPORTS = {
  assets: {
    label: "Assets",
    endpoint: "/reports/assets",
    filters: [
      { name: "status", label: "Status", options: STATUSES },
      { name: "category", label: "Category", options: CATEGORIES },
    ],
    columns: [
      { key: "assetTag", label: "Tag" },
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "serialNumber", label: "Serial" },
      { key: "purchaseDate", label: "Purchased", type: "date" },
      { key: "cost", label: "Cost", type: "number" },
    ],
    summary: (s) => [
      `${s.count.toLocaleString()} assets`,
      `Total value: ${s.totalValue.toLocaleString()}`,
    ],
  },

  assignments: {
    label: "Assignments",
    endpoint: "/reports/assignments",
    filters: [
      { name: "department", label: "Department", options: DEPARTMENTS },
      { name: "status", label: "Status", options: ["active", "returned"] },
      { name: "from", label: "Assigned from", type: "date" },
      { name: "to", label: "Assigned to", type: "date" },
    ],
    columns: [
      { key: "assetTag", label: "Asset tag" },
      { key: "assetName", label: "Asset" },
      { key: "category", label: "Category" },
      { key: "employeeId", label: "Employee ID" },
      { key: "employee", label: "Employee" },
      { key: "department", label: "Department" },
      { key: "assignedDate", label: "Assigned", type: "date" },
      { key: "returnDate", label: "Returned", type: "date" },
      { key: "status", label: "Status" },
    ],
    summary: (s) => [`${s.count.toLocaleString()} assignments`],
  },

  maintenance: {
    label: "Maintenance",
    endpoint: "/reports/maintenance",
    filters: [
      { name: "status", label: "Status", options: ["open", "completed"] },
      { name: "from", label: "Started from", type: "date" },
      { name: "to", label: "Started to", type: "date" },
    ],
    columns: [
      { key: "assetTag", label: "Asset tag" },
      { key: "assetName", label: "Asset" },
      { key: "category", label: "Category" },
      { key: "issue", label: "Issue" },
      { key: "vendor", label: "Vendor" },
      { key: "startDate", label: "Started", type: "date" },
      { key: "endDate", label: "Completed", type: "date" },
      { key: "cost", label: "Cost", type: "number" },
      { key: "status", label: "Status" },
    ],
    summary: (s) => [
      `${s.count.toLocaleString()} records`,
      `Total cost: ${s.totalCost.toLocaleString()}`,
    ],
  },
};