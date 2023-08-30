
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BASE_URL,
  PATH_PRODUCTCATEGORY,
  PATH_PRODUCTCATALOGUE,
  } from '../../utils/constants';
import makeApiCall from '../../utils/makeApiCall';
import moment from 'moment';
import MuiSelect from '../../components/select/select_index';
import { useSnackbar } from 'notistack';
import { productCategoryViewConfig } from '../../utils/display_configuration';

const useStyles = makeStyles((theme) => ({
  table: {
    margin: '0 auto',
    width: '90%',
  },
  titleCell: {
    width: '35%',
    textAlign: 'right',
    borderBottom: 'none',
  },
  valueCell: {
    textAlign: 'left',
    borderBottom: 'none',
  },
  link: {
    color: theme.palette.secondary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const CreateProductCategoryForm = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const styles = useStyles();

  const [formData, setFormData] = useState({});
        const [errorData, setErrorData] = useState({});


  const handleChange = (key, value) => {
    setFormData({ ...formData, ...{ [key]: value } });
  };

  const submitForm = async () => {
          const { 
      ...otherData } = formData;

      try {
        const resp = await makeApiCall(
          `${BASE_URL}${PATH_PRODUCTCATEGORY}`,
          'POST',
          JSON.stringify({
            ...otherData,
          })
        );

        if (resp.ok) {
          snackbar.enqueueSnackbar('Successfully created productCategory', {
            variant: 'success',
          });
          navigate({ pathname: '/productCategories' });
        } else {
          const jsonData = await resp.json();
          snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
            variant: 'error',
          });
        }
      } catch (error) {
        // Handle any errors that occur during the API calls or processing
        snackbar.enqueueSnackbar(`Error: ${error.message}`, {
          variant: 'error',
        });
      }
      };

  return (
    <>
      <Box padding={2}>
        <Grid>
          <Grid item lg={12} xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography className="page-heading" variant="h5">
                Create ProductCategory
              </Typography>
              <div className="action-buttons">
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  className="margin-right"
                  onClick={submitForm}
                >
                  Save
                </Button>
                &nbsp;
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate({ pathname: '/productCategories' })}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Grid>
          <Divider />
          <Box marginTop={2} className="form-container">
            <Grid container item lg={12} xs={12}>
              {Object.keys(productCategoryViewConfig)?.map((config, ind) => (
                <>
                  <Grid item lg={5} md={5} xs={12}>
                    <Box marginTop={1}>
                      <Typography variant="h6">{config}</Typography>
                      <Table size="small" className={styles.table}>
                        <TableBody>
                          {productCategoryViewConfig[config]?.map(
                            ({ key, value, type, required }) => (
                              <TableRow className="responsive-table-row">
                                <TableCell
                                  className={[
                                    styles.titleCell,
                                    'row-label',
                                  ].join(' ')}
                                >
                                  <Typography variant="body1">
                                    {value}
                                    {required ? '*' : ''}:
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  className={[
                                    styles.valueCell,
                                    'row-value',
                                  ].join(' ')}
                                >
                                  {key === 'ProductCategoryId' ? (
                                    <Typography variant="body1">
                                      {formData[key]}
                                    </Typography>
                                  ) : 
                                  type === 'date' ? (
                                    <Typography variant="body1">
                                      {formData[key] !== null &&
                                        moment(formData[key]).format(
                                          'DD-MMMM-YYYY HH:mm:ss A'
                                        )}
                                    </Typography>
                                  ) : type === 'boolean' ? (
                                    <Checkbox
                                      checked={formData[key] || false}
                                      onChange={(e) =>
                                        handleChange(key, e.target.checked)
                                      }
                                    />
                                  ) : (
                                    <>
                                      <TextField
                                        name={key}
                                        fullWidth
                                        className="text-field-custom"
                                        variant="outlined"
                                        size="small"
                                        type={type}
                                        error={errorData[key]}
                                        helperText={errorData[key]}
                                        value={formData[key] || ''}
                                        onChange={(e) => {
                                          if (e.target.reportValidity()) {
                                            handleChange(key, e.target.value);
                                          }
                                        }}
                                      />
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Grid>
                  <Grid item lg={1} md={1} xs={false} />
                </>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Box>
    </>
  );
};

export default CreateProductCategoryForm;
