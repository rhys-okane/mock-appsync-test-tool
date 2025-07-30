import {Response} from "express";
import {Invocation} from "../types/Invocation";

// Array of JSON payloads
export const invocations: Invocation[] = [];
export const lambdasAwaitingPayloads: Response[] = [];
