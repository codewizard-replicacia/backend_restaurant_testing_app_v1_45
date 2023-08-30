
import { useState, useEffect, createRef } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { AddBox, Edit, Visibility } from "@material-ui/icons";
import MuiTable from "../../components/table/table_index";
import { BASE_URL, PATH_PRODUCTCATALOGUE } from "../../utils/constants";
import { PATH_INVENTORYSTOCK } from "../../utils/constants";
import { PATH_PRODUCTCATEGORY } from "../../utils/constants";
import makeApiCall from "../../utils/makeApiCall";

function ProductCatalogueTable() {

  const tableRef = createRef();
  const snackbar = useSnackbar();
  const navigate =  useNavigate();



  const [InventoryStocks, setInventoryStocks] = useState({});

  useEffect(() => {
    const fetchInventoryStocks = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_INVENTORYSTOCK}`
      );
      const jsonResp = await typesResponse.json();
      const types = {};
      jsonResp.value.forEach(
        (item) =>
        (types[`${item.InventoryId}`] = item.CurrentStockUnits)
      );
      setInventoryStocks(types);
    };
    fetchInventoryStocks();
  }, []);


  const [ProductCategories, setProductCategories] = useState({});

  useEffect(() => {
    const fetchProductCategories = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_PRODUCTCATEGORY}`
      );
      const jsonResp = await typesResponse.json();
      const types = {};
      jsonResp.value.forEach(
        (item) =>
        (types[`${item.ProductCategoryId}`] = item.ProductName)
      );
      setProductCategories(types);
    };
    fetchProductCategories();
  }, []);

  const columns = [
    { title: "ProductId", field: "ProductId", editable: "never" },
      { title: "CategoryId", field: "CategoryId" },
      { title: "ProductName", field: "ProductName" },
      { title: "Stock", field: "ProductCatalogueStock", lookup: InventoryStocks },
      { title: "Category", field: "ProductCatalogueCategory", lookup: ProductCategorys },
  ];
  
  const fetchData = async (query) => {
    return new Promise((resolve, reject) => {
      const { page, orderBy, orderDirection, search, pageSize } = query;
      const url = `${BASE_URL}${PATH_PRODUCTCATALOGUE}`;
      let temp = url; // Initialize with the base URL
      let filterQuery = ""; // Initialize filter query as an empty string
  
      // Handle sorting
      if (orderBy) {
        temp += `?$orderby=${orderBy.field} ${orderDirection}`;
      }
  
      // Handle searching
      if (search) {
        filterQuery = `$filter=contains($screen.getSearchField().getName(), '${search}')`;
        temp += orderBy ? `&${filterQuery}` : `?${filterQuery}`;
      }
  
      // Handle pagination
      if (page > 0) {
        const skip = page * pageSize;
        temp += orderBy || search ? `&$skip=${skip}` : `?$skip=${skip}`;
      }
  
      const countUrl = search ? `${url}/$count?${filterQuery}` : `${BASE_URL}${PATH_PRODUCTCATALOGUE}/$count`;
      let total = null;
  
      makeApiCall(countUrl)
        .then((res) => res.text())
        .then((e) => {
          total = parseInt(e, 10);
        })
        .then(() => makeApiCall(temp))
        .then((res) => res.json())
        .then(({ value }) => {
          return resolve({
            data: value,
            page: page,
            totalCount: total,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <div className="product-container">
      {
      Object.keys(InventoryStocks).length > 0 && 
      Object.keys(ProductCategories).length > 0 && 
      (
        <MuiTable
          tableRef={tableRef}
          title="menu card table"
          cols={columns}
          data={fetchData}
          size={5}
          actions={[
            {
              icon: AddBox,
              tooltip: "Add",
              onClick: () => navigate("/ProductCatalogues/create"),
              isFreeAction: true,
            },
            {
              icon: Visibility,
              tooltip: "View",
              onClick: (event, rowData) =>
              navigate(`/ProductCatalogues/view/${rowData.ProductId}`),
            },
          ]}
          onRowDelete={async (oldData) => {
            const resp = await makeApiCall(
              `${BASE_URL}${PATH_PRODUCTCATALOGUE}(${oldData.ProductId})`,
              "DELETE"
            );
            if (resp.ok) {
              tableRef.current.onQueryChange();
              snackbar.enqueueSnackbar("Successfully deleted ProductCatalogues", {
                variant: "success",
              });
            } else {
              const jsonData = await resp.json();
              snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
                variant: "error",
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default ProductCatalogueTable;
