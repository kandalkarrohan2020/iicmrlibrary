import db from "../../config/dbconnect.js";
import moment from "moment";

// **Fetch All **
export const getAll = (req, res) => {
  const sql = "SELECT * FROM roles ORDER BY role";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Fetch All Menus**
export const getMenus = (req, res) => {
  const sql = "SELECT * FROM menu ORDER BY menuName";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const Id = parseInt(req.params.id);
  const sql = "SELECT * FROM roles WHERE roleid = ?";

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(result[0]);
  });
};

// Add Or Update
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const Id = req.body.roleid;

  const { role, registration } = req.body;
  console.log("Received data:", req.body);

  if (!role || !registration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (Id) {
    // **Update existing role**
    db.query("SELECT * FROM roles WHERE roleid = ?", [Id], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });
      if (result.length === 0)
        return res.status(404).json({ message: "Role not found" });

      const updateSQL = `UPDATE roles SET role=?, registration=?, updated_at=? WHERE roleid=?`;

      db.query(updateSQL, [role, registration, currentdate, Id], (err) => {
        if (err) {
          console.error("Error updating:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        return res.status(200).json({ message: "Role updated successfully" });
      });
    });
  } else {
    // **Check if Role Already Exists**
    db.query("SELECT * FROM roles WHERE role = ?", [role], (err, result) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });

      if (result.length > 0) {
        return res.status(202).json({ message: "Role already exists!" });
      }

      // **Add new role**
      const insertSQL = `INSERT INTO roles (role, registration, updated_at, created_at) VALUES (?, ?, ?, ?)`;

      db.query(
        insertSQL,
        [role, registration, currentdate, currentdate],
        (err, result) => {
          if (err) {
            console.error("Error inserting:", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          return res
            .status(201)
            .json({ message: "Role added successfully", Id: result.insertId });
        }
      );
    });
  }
};

//**Change status */
export const status = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Role ID" });
  }

  db.query("SELECT * FROM roles WHERE roleid = ?", [Id], (err, result) => {
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
      "UPDATE roles SET status = ? WHERE roleid = ?",
      [status, Id],
      (err, result) => {
        if (err) {
          console.error("Error deleting :", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Role status change successfully" });
      }
    );
  });
};

// assign Task to Users
export const assignTask = async (req, res) => {
  try {
    const { menus } = req.body;
    const Id = parseInt(req.params.id);

    const menuString = JSON.stringify(menus);

    if (isNaN(Id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Fetch Role details first
    db.query("SELECT * FROM roles WHERE roleid = ?", [Id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Update Role details
      db.query(
        "UPDATE roles SET menus = ? WHERE roleid = ? ",
        [menuString, Id],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating Role:", updateErr);
            return res
              .status(500)
              .json({ message: "Database error", error: updateErr });
          }

          res
            .status(200)
            .json({ message: "Role Wise task assigned successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error assigning tasks:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);
  console.log(Id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Role ID" });
  }

  db.query("SELECT * FROM roles WHERE roleid = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    db.query("DELETE FROM roles WHERE roleid = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Role deleted successfully" });
    });
  });
};
