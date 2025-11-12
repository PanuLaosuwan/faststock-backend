import pool from '../config/db.js';

const getAllProductsService = async () => {
      const result = await pool.query(
          'SELECT pid, pname, vol, category, unit, factor, subunit, "desc" FROM product'
      );
      return result.rows;
  };
  
  const getProductByIdService = async (id) => {
      const result = await pool.query(
          'SELECT * FROM product WHERE pid = $1',
          [id]
      );
      return result.rows[0];
  };
  const createProductService = async (product) => {
    const { pname, vol, category, unit, factor, subunit, desc } = product;
    const result = await pool.query(
      'INSERT INTO product (pname, vol, category, unit, factor, subunit, "desc") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [pname, vol, category, unit, factor, subunit, desc]
    );
    return result.rows[0];
  };
  const updateProductService = async (id, product) => {
    const { pname, vol, category, unit, factor, subunit, desc } = product;
    const result = await pool.query(
      'UPDATE product SET pname = $1, vol = $2, category = $3, unit = $4, factor = $5, subunit = $6, "desc" = $7 WHERE pid = $8 RETURNING *',
      [pname, vol, category, unit, factor, subunit, desc, id]
    );
    return result.rows[0];
  };
  const deleteProductService = async (id) => {
    const result = await pool.query(
      'DELETE FROM product WHERE pid = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  };
  const patchProductService = async (id, fields) => {
      const allowed = ['pname', 'vol', 'category', 'unit', 'factor', 'subunit', 'desc'];
      const setClauses = [];
      const values = [];
  
      allowed.forEach((field) => {
          if (Object.prototype.hasOwnProperty.call(fields, field)) {
              const column = field === 'desc' ? '"desc"' : field;
              values.push(fields[field]);
              setClauses.push(`${column} = $${values.length}`);
          }
      });
  
      if (setClauses.length === 0) {
          return null;
      }
  
      values.push(id);
  
      const result = await pool.query(
          `UPDATE product
           SET ${setClauses.join(', ')}
           WHERE pid = $${values.length}
           RETURNING pid, pname, vol, category, unit, factor, subunit, "desc"`,
          values
      );
      return result.rows[0];
  };
export default {
    getAllProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService,
    patchProductService
};