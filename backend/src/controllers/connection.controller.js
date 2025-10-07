import Connection from "../models/connection.model.js";

const sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if( senderId.toString() === receiverId ) {
      return res.status(400).json({ message: "You cannot send connection request to yourself." });
    }

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { SenderId: senderId, ReceiverId: receiverId },
        { SenderId: receiverId, ReceiverId: senderId },
      ],
    });

    if (existingConnection) {
      return res.status(409).json({
        message: "Connection request already exists.",
        connection: existingConnection,
      });
    }

    const newConnection = await Connection.create({
      SenderId: senderId,
      ReceiverId: receiverId,
    });

    const populatedConnection = await Connection.findById(
      newConnection._id
    ).populate("ReceiverId", "firstName lastName");

    res.status(201).json({
      message: `Connection request sent successfully to ${populatedConnection.ReceiverId.firstName} ${populatedConnection.ReceiverId.lastName}.`,
      connection: populatedConnection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    

    const connection = await Connection.findOne(
      {
        $or: [
          { SenderId: senderId, ReceiverId: receiverId },
          { SenderId: receiverId, ReceiverId: senderId },
        ],
      }
    );

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    if (connection.status !== "rejected" || connection.status !== "blocked") {
      return res.status(400).json({ message: `Cannot accept a ${connection.status} connection request.` });
    }

    const updatedConnection = await Connection.findByIdAndUpdate(
      connection._id,
      { status: "accepted" },
      { new: true }
    );

    res.status(200).json({
      message: "Connection request accepted successfully.",
      connection: updatedConnection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectConnectionRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const updatedConnection = await Connection.findOneAndUpdate(
      { $or: [
          { SenderId: senderId, ReceiverId: req.user._id },
          { SenderId: req.user._id, ReceiverId: senderId }
      ]},
      { status: "rejected" },
      { new: true }
    );

    if (!updatedConnection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    res.status(200).json({
      message: "Connection request rejected successfully.",
      connection: updatedConnection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const blockConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedConnection = await Connection.findOneAndUpdate(
      {
        $or: [
          { SenderId: req.user._id, ReceiverId: userId },
          { SenderId: userId, ReceiverId: req.user._id },
        ],
      },
      { status: "blocked" },
      { new: true }
    );
    if (!updatedConnection) {
      return res.status(404).json({ message: "Connection not found." });
    }
    res.status(200).json({
      message: "Connection blocked successfully.",
      connection: updatedConnection,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllPendingConnectionsRequests = async (req, res) => {
  try {
    const pendingConnections = await Connection.find({
      ReceiverId: req.user._id,
      status: "pending",
    }).populate("SenderId", "firstName lastName");

    res.status(200).json({
      message: "Pending connections fetched successfully.",
      connections: pendingConnections,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ SenderId: req.user._id }, { ReceiverId: req.user._id }],
      status: "accepted",
    }).populate("SenderId ReceiverId", "firstName lastName");

    res.status(200).json({
      message: "Connections fetched successfully.",
      connections: connections,
    });
  }
  catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  blockConnection,
  getAllPendingConnectionsRequests,
  getAllConnections
};
