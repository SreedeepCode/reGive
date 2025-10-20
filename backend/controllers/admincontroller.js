import express from "express";
import user from "../models/users.js";
import item from "../models/items.js";
import transactions from "../models/transaction.js";
import reports from "../models/reports.js";

export const FetchUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteUsers = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Id wasn't received" });

    await user.deleteOne({ _id: id });

    res.status(200).json({
      message: "Deletion successful",
    });
  } catch (error) {
    console.error("Error deleting the user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const FetchItems = async (req, res) => {
  try {
    const items = await item.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteItems = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Id wasn't received" });

    const deleted = await item.deleteOne({ _id: id });

    res.status(200).json({ message: "Item deletion successful" });
  } catch (error) {
    console.error("Error deleting the item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const FetchTransactions = async (req, res) => {
  try {
    const items = await transactions.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const FetchReports = async (req, res) => {
  try {
    const items = await reports.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetStatistics = async (req, res) => {
  try {
    const totalUsers = await user.countDocuments();
    const totalItems = await item.countDocuments();
    const totalTransactions = await transactions.countDocuments();
    const totalReports = await reports.countDocuments();

    res.status(200).json({
      totalUsers,
      totalItems,
      totalTransactions,
      totalReports,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
