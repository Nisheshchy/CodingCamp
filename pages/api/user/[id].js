import { requireAuth } from "@clerk/nextjs/api";

import { connect } from "../../../utils/db";
import User from "../../../models/User";

export default requireAuth(async (req, res) => {
  await connect();
  const { method } = req;
  switch (method) {
    case "GET":
      console.log("GET REQUEST 🚀");
      {
        try {
          const user = await User.find({ user: req.query.id });
          console.log(`GET /api/user/${req.query.id} returned:`, JSON.stringify(user));
          res.status(200).json(user);
        } catch (err) {
          console.error(err);
          res.status(500).json({ msg: "Something went wrong" });
        }
      }
      break;
    case "PUT": {
      console.log("PUT REQUEST 🚀");
      try {
        const { course, completed } = req.body;
        console.log(req.body);
        
        const user = await User.findOne({ user: req.query.id });
        if (user && !user.courses.some((c) => c.course === course)) {
          user.courses.push({ course, completed });
          await user.save();
        }
        
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ msg: "Something went wrong" });
      }
      break;
    }
    default:
      res.status(200).json({});
      break;
  }
});
