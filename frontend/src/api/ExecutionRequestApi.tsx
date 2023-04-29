import { z } from "zod";
import { ExecutionRequest } from "../routes/AddRequestForm";
import { type } from "os";

const requestUrl = "http://localhost:8080/execution-requests/";

const DateTime = z.preprocess(
  (val) => (typeof val == "string" ? val.concat("Z") : undefined),
  z.string().datetime()
);

const ExecutionRequestPayload = z.object({
  //issueLink: z.string().url(),
  title: z.string().min(1),
  description: z.string(),
  statement: z.string().min(1),
  readOnly: z.boolean(),
  datasourceConnectionId: z.string().min(1),
  //confidential: z.boolean(),
});

const Comment = z.object({
  comment: z.string(),
  createdAt: DateTime,
  id: z.string(),
});

const ExecutionRequestResponse = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  statement: z.string().min(1),
  readOnly: z.boolean(),
  // connection: z.string().min(1), currently not contained in response
  executionStatus: z.string(),
  createdAt: DateTime,
});

const ExecutionRequestResponseWithComments = ExecutionRequestResponse.extend({
  events: z.array(Comment),
});

const ExecutionRequestsResponse = z.array(ExecutionRequestResponse);

type ExecutionRequestResponseWithComments = z.infer<
  typeof ExecutionRequestResponseWithComments
>;
type ExecutionRequestResponse = z.infer<typeof ExecutionRequestResponse>;
type ExecutionRequestsResponse = z.infer<typeof ExecutionRequestsResponse>;
type ExecutionRequestPayload = z.infer<typeof ExecutionRequestPayload>;

const addRequest = async (payload: ExecutionRequest): Promise<boolean> => {
  const mappedPayload: ExecutionRequestPayload = {
    title: payload.title,
    description: payload.description,
    statement: payload.statement,
    readOnly: payload.readOnly,
    datasourceConnectionId: payload.connection,
  };
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mappedPayload),
  });
  return true;
};

const getRequests = async (): Promise<ExecutionRequestsResponse> => {
  const response = await fetch(requestUrl);
  const json = await response.json();
  console.log(json);
  const requests = ExecutionRequestsResponse.parse(json);
  return requests;
};

const getSingleRequest = async (
  id: string
): Promise<ExecutionRequestResponseWithComments | undefined> => {
  const response = await fetch(requestUrl + id);
  if (response.status == 404) {
    return undefined;
  }
  const json = await response.json();
  console.log(json);
  const request = ExecutionRequestResponseWithComments.parse(json);
  return request;
};

export { addRequest, getRequests, getSingleRequest };
export type {
  ExecutionRequestResponse,
  ExecutionRequestsResponse,
  ExecutionRequestResponseWithComments,
};
