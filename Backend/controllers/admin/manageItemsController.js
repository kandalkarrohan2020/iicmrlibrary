import db from "../../config/dbconnect.js";
import moment from "moment";

// **Fetch All**
export const getAll = (req, res) => {
  const sql = "SELECT * FROM books ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    const formatted = result.map((row) => ({
      ...row,
      created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
      updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
    }));

    res.json(formatted);
  });
};

// **Fetch All**
export const getAllActive = (req, res) => {
  const sql =
    "SELECT * FROM books WHERE status = 'Active' ORDER BY itemId DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const Id = req.params.id;
  const sql = "SELECT * FROM books WHERE itemId = ?";
  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    const formatted = result.map((row) => ({
      ...row,
      created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
      updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
    }));

    res.json(formatted[0]);
  });
};

// **Add New Item (Book)**
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const {
    title,
    price,
    description,
    author_name,
    publisher,
    category,
    isbn,
    edition,
    language,
    total_copies,
    available_copies,
    publication_year,
    shelf_location,
  } = req.body;

  if (!title || !description || !category || !isbn || !total_copies) {
    return res.status(400).json({
      message:
        "Title, Description, Category, ISBN and Total Copies are required",
    });
  }

  const totalCopies = parseInt(total_copies, 10);
  const availableCopies = available_copies
    ? parseInt(available_copies, 10)
    : totalCopies;

  if (isNaN(totalCopies) || totalCopies <= 0) {
    return res.status(400).json({ message: "Invalid total copies" });
  }

  // Single image
  const itemImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO books (
      title, price, description, author_name, publisher, category,
      isbn, edition, language, total_copies, available_copies,
      publication_year, shelf_location, image, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      price,
      description,
      author_name || null,
      publisher || null,
      category,
      isbn,
      edition || null,
      language || null,
      totalCopies,
      availableCopies,
      publication_year || null,
      shelf_location || null,
      itemImageUrl,
      currentdate,
      currentdate,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        message: "Item added successfully",
      });
    }
  );
};

// **Edit Item (Book)**
export const edit = (req, res) => {
  const itemId = req.params.id;
  if (!itemId) return res.status(400).json({ message: "Invalid Item ID" });

  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const {
    title,
    price,
    description,
    author_name,
    publisher,
    category,
    isbn,
    edition,
    language,
    total_copies,
    available_copies,
    publication_year,
    shelf_location,
  } = req.body;

  if (!title || !description || !category || !isbn || !total_copies) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const totalCopies = parseInt(total_copies, 10);
  const availableCopies = available_copies
    ? parseInt(available_copies, 10)
    : totalCopies;

  if (availableCopies > totalCopies) {
    return res.status(400).json({
      message: "Available copies cannot exceed total copies",
    });
  }

  // Single image
  const itemImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  let sql = `
    UPDATE books SET
      title = ?, price = ?, description = ?, author_name = ?, publisher = ?,
      category = ?, isbn = ?, edition = ?, language = ?,
      total_copies = ?, available_copies = ?,
      publication_year = ?, shelf_location = ?, updated_at = ?
  `;

  const values = [
    title,
    price,
    description,
    author_name || null,
    publisher || null,
    category,
    isbn,
    edition || null,
    language || null,
    totalCopies,
    availableCopies,
    publication_year || null,
    shelf_location || null,
    currentdate,
  ];

  if (itemImageUrl) {
    sql += `, image = ?`;
    values.push(itemImageUrl);
  }

  sql += ` WHERE itemId = ?`;
  values.push(itemId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Update failed" });
    }

    res.status(200).json({ message: "Item updated successfully" });
  });
};

//**Change status */
export const status = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Blog ID" });
  }

  db.query("SELECT * FROM books WHERE itemId = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    let status = "";
    if (result[0].status === "Active") {
      status = "Inactive";
    } else {
      status = "Active";
    }
    console.log(status);
    db.query(
      "UPDATE books SET status = ? WHERE itemId = ?",
      [status, Id],
      (err, result) => {
        if (err) {
          console.error("Error deleting :", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Item status change successfully" });
      }
    );
  });
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query("SELECT * FROM books WHERE itemId = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    db.query("DELETE FROM books WHERE itemId = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Item deleted successfully" });
    });
  });
};
