import db from "../../config/dbconnect.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/nodeMailer.js";
import fs from "fs";
import path from "path";

const saltRounds = 10;

export const getAll = (req, res) => {
  const partnerLister = req.params.partnerlister;

  if (!partnerLister) {
    return res.status(401).json({ message: "Partner Lister Not Selected" });
  }

  let sql;

  if (partnerLister === "Promoter") {
    sql = `
      SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
      FROM onboardingpartner
      LEFT JOIN (
        SELECT p1.*
        FROM partnerFollowup p1
        INNER JOIN (
          SELECT partnerId, MAX(created_at) AS latest
          FROM partnerFollowup
          WHERE role = 'Onboarding Partner'
          GROUP BY partnerId
        ) p2 ON p1.partnerId = p2.partnerId AND p1.created_at = p2.latest
        WHERE p1.role = 'Onboarding Partner'
      ) pf ON onboardingpartner.partnerid = pf.partnerId
      WHERE onboardingpartner.partneradder IS NOT NULL 
        AND onboardingpartner.partneradder != ''
      ORDER BY onboardingpartner.created_at DESC;
    `;
  } else if (partnerLister === "Reparv") {
    sql = `
      SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
      FROM onboardingpartner
      LEFT JOIN (
        SELECT p1.*
        FROM partnerFollowup p1
        INNER JOIN (
          SELECT partnerId, MAX(created_at) AS latest
          FROM partnerFollowup
          WHERE role = 'Onboarding Partner'
          GROUP BY partnerId
        ) p2 ON p1.partnerId = p2.partnerId AND p1.created_at = p2.latest
        WHERE p1.role = 'Onboarding Partner'
      ) pf ON onboardingpartner.partnerid = pf.partnerId
      WHERE onboardingpartner.partneradder IS NULL 
        OR onboardingpartner.partneradder = ''
      ORDER BY onboardingpartner.created_at DESC;
    `;
  } else {
    sql = `
      SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
      FROM onboardingpartner
      LEFT JOIN (
        SELECT p1.*
        FROM partnerFollowup p1
        INNER JOIN (
          SELECT partnerId, MAX(created_at) AS latest
          FROM partnerFollowup
          WHERE role = 'Onboarding Partner'
          GROUP BY partnerId
        ) p2 ON p1.partnerId = p2.partnerId AND p1.created_at = p2.latest
        WHERE p1.role = 'Onboarding Partner'
      ) pf ON onboardingpartner.partnerid = pf.partnerId
      ORDER BY onboardingpartner.created_at DESC;
    `;
  }

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching partners:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    const formatted = result.map((row) => ({
      ...row,
      created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
      updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
      followUp: row.followUp || null,
      followUpDate: row.followUpDate
        ? moment(row.followUpDate).format("DD MMM YYYY | hh:mm A")
        : null,
    }));

    res.json(formatted);
  });
};

export const getAllOld = (req, res) => {
  const paymentStatus = req.params.paymentStatus;

  if (!paymentStatus) {
    return res.status(401).json({ message: "Payment Status Not Selected" });
  }

  let sql = "";

  const followUpJoin = `
    LEFT JOIN (
      SELECT p1.*
      FROM partnerFollowup p1
      INNER JOIN (
        SELECT partnerId, MAX(created_at) AS latest
        FROM partnerFollowup
        WHERE role = 'Onboarding Partner'
        GROUP BY partnerId
      ) p2 ON p1.partnerId = p2.partnerId AND p1.created_at = p2.latest
      WHERE p1.role = 'Onboarding Partner'
    ) pf ON onboardingpartner.partnerid = pf.partnerId
  `;

  switch (paymentStatus) {
    case "Success":
      sql = `
        SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
        FROM onboardingpartner
        ${followUpJoin}
        WHERE onboardingpartner.paymentstatus = 'Success' 
        ORDER BY onboardingpartner.created_at DESC`;
      break;

    case "Follow Up":
      sql = `
        SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
        FROM onboardingpartner
        ${followUpJoin}
        WHERE onboardingpartner.paymentstatus = 'Follow Up' AND onboardingpartner.loginstatus = 'Inactive'
        ORDER BY onboardingpartner.updated_at DESC`;
      break;

    case "Pending":
      sql = `
        SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
        FROM onboardingpartner
        ${followUpJoin}
        WHERE onboardingpartner.paymentstatus = 'Pending' 
        ORDER BY onboardingpartner.created_at DESC`;
      break;

    case "Free":
      sql = `
        SELECT onboardingpartner.*, pf.followUp, pf.created_at AS followUpDate
        FROM onboardingpartner
        ${followUpJoin}
        WHERE onboardingpartner.paymentstatus != 'Success'
          AND onboardingpartner.loginstatus = 'Active'
        ORDER BY onboardingpartner.created_at DESC`;
      break;

    default:
      sql = `SELECT * FROM onboardingpartner ORDER BY partnerid DESC`;
  }

  db.query(sql, (err, partners) => {
    if (err) {
      console.error("Error fetching partners:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Updated count query for accurate grouping including "Free"
    const countQuery = `
      SELECT 'Success' AS status, COUNT(*) AS count
      FROM onboardingpartner
      WHERE paymentstatus = 'Success'
      UNION ALL
      SELECT 'Pending', COUNT(*)
      FROM onboardingpartner
      WHERE paymentstatus = 'Pending'
      UNION ALL
      SELECT 'Follow Up', COUNT(*)
      FROM onboardingpartner
      WHERE paymentstatus = 'Follow Up' AND loginstatus = 'Inactive'
      UNION ALL
      SELECT 'Free', COUNT(*)
      FROM onboardingpartner
      WHERE paymentstatus != 'Success' AND loginstatus = 'Active'
    `;

    db.query(countQuery, (countErr, counts) => {
      if (countErr) {
        console.error("Error fetching counts:", countErr);
        return res
          .status(500)
          .json({ message: "Database error", error: countErr });
      }

      const formatted = (partners || []).map((row) => ({
        ...row,
        created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
        updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
        followUp: row.followUp || null,
        followUpDate: row.followUpDate
          ? moment(row.followUpDate).format("DD MMM YYYY | hh:mm A")
          : null,
      }));

      const paymentStatusCounts = {};
      counts.forEach((item) => {
        paymentStatusCounts[item.status] = item.count;
      });

      return res.json({
        data: formatted,
        paymentStatusCounts,
      });
    });
  });
};

// **Fetch All**
export const getAllActive = (req, res) => {
  const sql =
    "SELECT * FROM onboardingpartner WHERE status = 'Active' ORDER BY partnerid DESC";
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
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }
  const sql = "SELECT * FROM onboardingpartner WHERE partnerid = ?";

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.json(result[0]);
    console.log(result[0]);
  });
};

// **Add New **
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const {
    fullname,
    contact,
    email,
    intrest,
    refrence,
    address,
    state,
    city,
    pincode,
    experience,
    adharno,
    panno,
    bankname,
    accountholdername,
    accountnumber,
    ifsc,
  } = req.body;

  if (!fullname || !contact || !email || !intrest) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const createReferralCode = (length = 6) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "REF-" + code;
  };

  const generateUniqueReferralCode = (callback) => {
    const code = createReferralCode();
    db.query(
      "SELECT referral FROM onboardingpartner WHERE referral = ?",
      [code],
      (err, results) => {
        if (err) {
          return callback(err, null);
        }
        if (results.length > 0) {
          // Code exists, retry
          return generateUniqueReferralCode(callback);
        }
        // Unique code found
        return callback(null, code);
      }
    );
  };

  const adharImageFile = req.files?.["adharImage"]?.[0];
  const panImageFile = req.files?.["panImage"]?.[0];

  const adharImageUrl = adharImageFile
    ? `/uploads/${adharImageFile.filename}`
    : null;
  const panImageUrl = panImageFile ? `/uploads/${panImageFile.filename}` : null;

  const checkSql = `SELECT * FROM onboardingpartner WHERE contact = ? OR email = ?`;

  db.query(checkSql, [contact, email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing Partner:", checkErr);
      return res.status(500).json({
        message: "Database error during validation",
        error: checkErr,
      });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({
        message: "OnBoarding Partner already exists with this contact or email",
      });
    }

    // Now generate a unique referral code
    generateUniqueReferralCode((referralErr, referralCode) => {
      if (referralErr) {
        console.error("Referral code generation failed:", referralErr);
        return res.status(500).json({
          message: "Error generating unique referral code",
          error: referralErr,
        });
      }

      const sql = `INSERT INTO onboardingpartner 
      (fullname, contact, email, intrest, refrence, referral, address, state, city, pincode, experience, adharno, panno, bankname, accountholdername, accountnumber, ifsc, adharimage, panimage, updated_at, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          fullname,
          contact,
          email,
          intrest,
          refrence,
          referralCode,
          address,
          state,
          city,
          pincode,
          experience,
          adharno,
          panno,
          bankname,
          accountholdername,
          accountnumber,
          ifsc,
          adharImageUrl,
          panImageUrl,
          currentdate,
          currentdate,
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting:", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          // Insert default follow-up
          db.query(
            "INSERT INTO partnerFollowup (partnerId, role, followUp, followUpText, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
              result.insertId,
              "Onboarding Partner",
              "New",
              "Newly Added Onboarding Partner",
              currentdate,
              currentdate,
            ],
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error("Error Adding Follow Up:", insertErr);
                return res
                  .status(500)
                  .json({ message: "Database error", error: insertErr });
              }

              return res.status(201).json({
                message: "OnBoarding Partner added successfully",
                Id: result.insertId,
              });
            }
          );
        }
      );
    });
  });
};

export const edit = (req, res) => {
  const partnerid = parseInt(req.params.id);
  if (isNaN(partnerid)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const {
    fullname,
    contact,
    email,
    intrest,
    address,
    state,
    city,
    pincode,
    experience,
    adharno,
    panno,
    bankname,
    accountholdername,
    accountnumber,
    ifsc,
  } = req.body;

  if (!fullname || !contact || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Handle uploaded files
  const adharImageFiles = req.files?.["adharImage"] || [];
  const panImageFiles   = req.files?.["panImage"] || [];

  const newAdharImageUrls = adharImageFiles.map(f => `/uploads/${f.filename}`);
  const newPanImageUrls   = panImageFiles.map(f => `/uploads/${f.filename}`);

  // Fetch old images first
  const selectSql = `SELECT adharimage, panimage FROM onboardingpartner WHERE partnerid = ?`;
  db.query(selectSql, [partnerid], (selectErr, rows) => {
    if (selectErr) {
      console.error("Error fetching old images:", selectErr);
      return res.status(500).json({ message: "Database error", error: selectErr });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Delete old adhar images
    if (rows[0].adharimage) {
      try {
        const oldAdharImages = JSON.parse(rows[0].adharimage);
        oldAdharImages.forEach(imgPath => {
          const filePath = path.join(process.cwd(), imgPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } catch (err) {
        console.warn("Error parsing old adharimage:", err);
      }
    }

    // Delete old pan images
    if (rows[0].panimage) {
      try {
        const oldPanImages = JSON.parse(rows[0].panimage);
        oldPanImages.forEach(imgPath => {
          const filePath = path.join(process.cwd(), imgPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } catch (err) {
        console.warn("Error parsing old panimage:", err);
      }
    }

    // Prepare new JSON arrays
    const adharImagesJson = newAdharImageUrls.length > 0 ? JSON.stringify(newAdharImageUrls) : null;
    const panImagesJson   = newPanImageUrls.length > 0 ? JSON.stringify(newPanImageUrls) : null;

    // Build update query
    let updateSql = `
      UPDATE onboardingpartner 
      SET fullname = ?, contact = ?, email = ?, intrest = ?, address = ?, state = ?, city = ?, 
          pincode = ?, experience = ?, adharno = ?, panno = ?, bankname = ?, accountholdername = ?, 
          accountnumber = ?, ifsc = ?, updated_at = ?
    `;
    const updateValues = [
      fullname,
      contact,
      email,
      intrest,
      address,
      state,
      city,
      pincode,
      experience,
      adharno,
      panno,
      bankname,
      accountholdername,
      accountnumber,
      ifsc,
      currentdate,
    ];

    if (adharImagesJson) {
      updateSql += `, adharimage = ?`;
      updateValues.push(adharImagesJson);
    }

    if (panImagesJson) {
      updateSql += `, panimage = ?`;
      updateValues.push(panImagesJson);
    }

    updateSql += ` WHERE partnerid = ?`;
    updateValues.push(partnerid);

    db.query(updateSql, updateValues, (updateErr) => {
      if (updateErr) {
        console.error("Error updating Partner:", updateErr);
        return res
          .status(500)
          .json({ message: "Database error during update", error: updateErr });
      }

      res.status(200).json({ message: "Partner updated successfully" });
    });
  });
};

export const editOld = (req, res) => {
  const partnerid = parseInt(req.params.id);
  if (isNaN(partnerid)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const {
    fullname,
    contact,
    email,
    intrest,
    address,
    state,
    city,
    pincode,
    experience,
    adharno,
    panno,
    bankname,
    accountholdername,
    accountnumber,
    ifsc,
  } = req.body;

  if (!fullname || !contact || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Handle uploaded files
  const adharImageFile = req.files?.["adharImage"]?.[0];
  const panImageFile = req.files?.["panImage"]?.[0];

  const adharImageUrl = adharImageFile
    ? `/uploads/${adharImageFile.filename}`
    : null;
  const panImageUrl = panImageFile ? `/uploads/${panImageFile.filename}` : null;

  let updateSql = `UPDATE onboardingpartner SET fullname = ?, contact = ?, email = ?, intrest = ?, address = ?, state = ?, city = ?, pincode = ?, experience = ?, adharno = ?, panno = ?, bankname = ?, accountholdername = ?, accountnumber = ?, ifsc = ?, updated_at = ?`;
  const updateValues = [
    fullname,
    contact,
    email,
    intrest,
    address,
    state,
    city,
    pincode,
    experience,
    adharno,
    panno,
    bankname,
    accountholdername,
    accountnumber,
    ifsc,
    currentdate,
  ];

  if (adharImageUrl) {
    updateSql += `, adharimage = ?`;
    updateValues.push(adharImageUrl);
  }

  if (panImageUrl) {
    updateSql += `, panimage = ?`;
    updateValues.push(panImageUrl);
  }

  updateSql += ` WHERE partnerid = ?`;
  updateValues.push(partnerid);

  db.query(updateSql, updateValues, (updateErr, result) => {
    if (updateErr) {
      console.error("Error updating Partner:", updateErr);
      return res
        .status(500)
        .json({ message: "Database error during update", error: updateErr });
    }

    res.status(200).json({ message: "Partner updated successfully" });
  });
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  db.query(
    "SELECT * FROM onboardingpartner WHERE partnerid = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Sales person not found" });
      }

      db.query(
        "DELETE FROM onboardingpartner WHERE partnerid = ?",
        [Id],
        (err) => {
          if (err) {
            console.error("Error deleting :", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res.status(200).json({ message: "Partner deleted successfully" });
        }
      );
    }
  );
};

//**Change status */
export const status = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  db.query(
    "SELECT * FROM onboardingpartner WHERE partnerid = ?",
    [Id],
    (err, result) => {
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
        "UPDATE onboardingpartner SET status = ? WHERE partnerid = ?",
        [status, Id],
        (err, result) => {
          if (err) {
            console.error("Error deleting :", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res
            .status(200)
            .json({ message: "Partner status change successfully" });
        }
      );
    }
  );
};

// Update Payment ID and Send Email
export const updatePaymentId = async (req, res) => {
  try {
    const partnerid = req.params.id;
    if (!partnerid) {
      return res.status(400).json({ message: "Invalid Partner ID" });
    }

    const { amount, paymentid } = req.body;
    if (!amount || !paymentid) {
      return res
        .status(400)
        .json({ message: "Amount and Payment ID are required" });
    }

    const isValid = await verifyRazorpayPayment(paymentid, amount);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid Payment ID" });
    }

    // Get partner details
    db.query(
      "SELECT * FROM onboardingpartner WHERE partnerid = ?",
      [partnerid],
      async (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Partner not found" });
        }

        const email = result[0].email;

        const extractNameFromEmail = (email) => {
          if (!email) return "";
          const namePart = email.split("@")[0];
          const lettersOnly = namePart.match(/[a-zA-Z]+/);
          if (!lettersOnly) return "";
          const name = lettersOnly[0].toLowerCase();
          return name.charAt(0).toUpperCase() + name.slice(1);
        };

        const username = extractNameFromEmail(email);

        const generatePassword = () => {
          const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
          let password = "";
          for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return password;
        };

        const password = generatePassword();
        let hashedPassword;

        try {
          hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashErr) {
          console.error("Error hashing password:", hashErr);
          return res.status(500).json({ message: "Failed to hash password" });
        }

        const updateSql = `
          UPDATE onboardingpartner 
          SET amount = ?, paymentid = ?, username = ?, password = ?, paymentstatus = "Success", loginstatus = "Active" 
          WHERE partnerid = ?
        `;
        const updateValues = [
          amount,
          paymentid,
          username,
          hashedPassword,
          partnerid,
        ];

        db.query(updateSql, updateValues, async (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating Payment ID:", updateErr);
            return res.status(500).json({
              message: "Database error during update",
              error: updateErr,
            });
          }

          try {
            await sendEmail(
              email,
              username,
              password,
              "Onboarding Partner",
              "https://onboarding.reparv.in"
            );
            return res.status(200).json({
              message: "Payment ID updated and email sent successfully.",
              partner: {
                partnerid,
                username,
                email,
              },
            });
          } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.status(500).json({
              message: "Payment ID updated but failed to send email.",
              partner: {
                partnerid,
                username,
                email,
              },
            });
          }
        });
      }
    );
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res
      .status(500)
      .json({ message: "Unexpected server error", error: err });
  }
};

export const fetchFollowUpList = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  const sql =
    "SELECT * FROM partnerFollowup WHERE partnerId = ? AND role = ? ORDER BY created_at DESC";
  db.query(sql, [Id, "Onboarding Partner"], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
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

export const addFollowUp = async (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  const { followUp, followUpText } = req.body;
  if (!followUp || !followUpText) {
    return res.status(400).json({ message: "Empty Follow Up or Text" });
  }

  // Check if onboarding partner exists
  db.query(
    "SELECT * FROM onboardingpartner WHERE partnerid = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "Onboarding partner not found." });
      }

      // Insert follow-up entry
      db.query(
        "INSERT INTO partnerFollowup (partnerId, role, followUp, followUpText, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          Id,
          "Onboarding Partner",
          followUp.trim(),
          followUpText.trim(),
          currentdate,
          currentdate,
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error Adding Follow Up:", insertErr);
            return res
              .status(500)
              .json({ message: "Database error", error: insertErr });
          }

          // Update partnerLister in onboardingpartner
          db.query(
            "UPDATE onboardingpartner SET paymentstatus = 'Follow Up', updated_at = ? WHERE partnerid = ?",
            [currentdate, Id],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating paymentstatus:", updateErr);
                return res
                  .status(500)
                  .json({ message: "Database error", error: updateErr });
              }

              return res.status(200).json({
                message:
                  "Partner Follow Up added and payment status updated to 'Follow Up'.",
              });
            }
          );
        }
      );
    }
  );
};

export const assignLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const Id = parseInt(req.params.id);

    if (isNaN(Id)) {
      return res.status(400).json({ message: "Invalid Partner ID" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use 10 as salt rounds

    db.query(
      "SELECT * FROM onboardingpartner WHERE partnerid = ?",
      [Id],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "Partner not found" });
        }

        let loginstatus = "Active";
        const email = result[0].email;

        db.query(
          "UPDATE onboardingpartner SET loginstatus = ?, username = ?, password = ? WHERE partnerid = ?",
          [loginstatus, username, hashedPassword, Id],
          (err, updateResult) => {
            if (err) {
              console.error("Error updating record:", err);
              return res
                .status(500)
                .json({ message: "Database error", error: err });
            }

            // Send email after successful update
            sendEmail(
              email,
              username,
              password,
              "Onboarding Partner",
              "https://onboarding.reparv.in"
            )
              .then(() => {
                res.status(200).json({
                  message:
                    "Partner login assigned successfully and email sent.",
                });
              })
              .catch((emailError) => {
                console.error("Error sending email:", emailError);
                res
                  .status(500)
                  .json({ message: "Login updated but email failed to send." });
              });
          }
        );
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected server error", error });
  }
};
