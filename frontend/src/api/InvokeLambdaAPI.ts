import type {Invocation} from "../store/types/store/Invocation";
import {API_BASE_URL} from "./constants/API";

export const invokeLambdaAPI = async (payload: string): Promise<Invocation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({payload}),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Error invoking Lambda API:", error);
    throw error;
  }
};
