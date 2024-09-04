const express = require("express");
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;
const fs = require("fs");

//Middleware-Plugin
app.use(express.urlencoded({ extended: false }));

//Routes
// HTML RENDER DATA(for Browser)
app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
  res.send(html);
});
//JSON DATA(for apps other than Browser)
app.get("/api/users", (req, res) => {
  return res.json(users);
});

//ID Dynamic Parameter

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  })
  .patch((req, res) => {
    const body = req.body;
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], ...body };
      updatedUser.id = id;
      users[userIndex] = updatedUser;
      fs.writeFile("MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "Error", message: "Failed to update user data" });
        }
        return res.json({ status: "Success", updatedUser });
      });
    } else {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex !== -1) {
      users.splice(userIndex, 1); // Remove the user from the array
      fs.writeFile(
        "./MOCK_DATA.json",
        JSON.stringify(users, null, 2),
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ status: "Error", message: "Failed to delete user" });
          }
          return res.json({ status: "Success", message: "User deleted" });
        }
      );
    } else {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }
  });

app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    return res.json({
      status: "Success",
      id: users.length,
    });
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
