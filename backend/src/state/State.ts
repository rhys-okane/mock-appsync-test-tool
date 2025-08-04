import {Response} from "express";
import {Invocation} from "../types/Invocation";

export const invocations: Invocation[] = [];
export const lambdasAwaitingPayloads: Response[] = [];
