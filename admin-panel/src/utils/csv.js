export const downloadCSV = (data, filename = "export.csv") => {
  const header = Object.keys(data[0]).join(",");
  const csv = data.map(row => Object.values(row).join(","));
  const csvContent = "data:text/csv;charset=utf-8," + [header, ...csv].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

