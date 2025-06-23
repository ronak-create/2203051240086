// src/utils/logger.js

import axios from 'axios';

const LOGGING_URL = "http://20.244.56.144/evaluation-service/logs";

export async function Log(stack, level, pkg, message) {
  try {
    await axios.post(LOGGING_URL, {
      stack,
      level,
      package: pkg,
      message
    });
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
}
