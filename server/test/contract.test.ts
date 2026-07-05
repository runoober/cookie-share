// Cross-implementation contract tests. The fixtures in contract/vectors.json
// are shared with the Worker test suite (test/worker.test.js at the repo
// root); both backends must pass every case so the protocol cannot drift.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createApp } from "../src/app";
import { decryptPayload, encryptPayload } from "../src/crypto";
import { createDatabase } from "../src/db";
import { CookieStore } from "../src/store";
import type { RuntimeConfig } from "../src/types";
import vectors from "../../contract/vectors.json";

const sampleCookies = [
  {
    name: "session",
    value: "token",
    domain: "example.com",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  },
];

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

describe("protocol contract vectors", () => {
  let tempDir: string;
  let config: RuntimeConfig;
  let store: CookieStore;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cookie-share-contract-"));
    config = {
      host: "127.0.0.1",
      port: 3000,
      serverRoot: tempDir,
      dbPath: path.join(tempDir, "cookie-share.db"),
      pathSecret: "secret-path",
      basePath: "/secret-path",
      adminPassword: "admin-secret",
      transportSecret: vectors.secret,
    };

    store = new CookieStore(createDatabase(config));
    const app = createApp(config, store);
    server = await new Promise<Server>((resolve) => {
      const nextServer = app.listen(0, config.host, () => resolve(nextServer));
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://${config.host}:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    store.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  async function sendRaw(body: unknown): Promise<Response> {
    return fetch(`${baseUrl}${config.basePath}/send-cookies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function sendCookies(id: unknown, url: unknown = "https://example.com/login", cookies: unknown = sampleCookies): Promise<Response> {
    return sendRaw(encryptPayload(vectors.secret, { id, url, cookies }));
  }

  test("decrypts the reference envelope and applies documented normalization", async () => {
    const sendResponse = await sendRaw(vectors.send.envelope);
    expect(sendResponse.status).toBe(200);

    const record = store.getCookieRecord(vectors.send.expected.id);
    expect(record).toMatchObject({
      id: vectors.send.expected.id,
      url: vectors.send.expected.url,
      host: vectors.send.expected.host,
    });

    const receiveResponse = await fetch(
      `${baseUrl}${config.basePath}/receive-cookies/${vectors.send.expected.id}`
    );
    expect(receiveResponse.status).toBe(200);
    const received = decryptPayload(vectors.secret, await readJson(receiveResponse)) as {
      cookies: unknown[];
    };
    expect(received.cookies[0]).toEqual(vectors.send.expected.cookie);
  });

  test("rejects every invalid envelope fixture", async () => {
    for (const envelope of vectors.invalidEnvelopes) {
      const response = await sendRaw(envelope);
      expect(response.status, `envelope: ${JSON.stringify(envelope)}`).toBe(400);
      expect(decryptPayload(vectors.secret, await readJson(response))).toMatchObject({
        success: false,
        message: "Invalid encrypted payload",
      });
    }
  });

  test("accepts every valid id fixture", async () => {
    for (const id of vectors.ids.valid) {
      const response = await sendCookies(id);
      expect(response.status, `id: ${JSON.stringify(id)}`).toBe(200);
    }
  });

  test("rejects every invalid id fixture", async () => {
    for (const id of vectors.ids.invalid) {
      const response = await sendCookies(id);
      expect(response.status, `id: ${JSON.stringify(id)}`).toBe(400);
      expect(decryptPayload(vectors.secret, await readJson(response))).toMatchObject({
        success: false,
        message: "Invalid ID. Only letters and numbers are allowed.",
      });
    }
  });

  test("normalizes every valid url fixture", async () => {
    for (const [index, urlCase] of vectors.urls.valid.entries()) {
      const id = `urlcase${index}`;
      const response = await sendCookies(id, urlCase.input);
      expect(response.status, `url: ${JSON.stringify(urlCase.input)}`).toBe(200);
      expect(store.getCookieRecord(id), `url: ${JSON.stringify(urlCase.input)}`).toMatchObject({
        url: urlCase.normalized,
        host: urlCase.host,
      });
    }
  });

  test("rejects every invalid url fixture", async () => {
    for (const url of vectors.urls.invalid) {
      const response = await sendCookies("urlinvalid1", url);
      expect(response.status, `url: ${JSON.stringify(url)}`).toBe(400);
      expect(decryptPayload(vectors.secret, await readJson(response))).toMatchObject({
        success: false,
        message: "Invalid URL",
      });
    }
  });

  test("rejects every invalid cookie fixture", async () => {
    for (const cookie of vectors.cookies.invalid) {
      const response = await sendCookies("cookieinvalid1", "https://example.com/", [cookie]);
      expect(response.status, `cookie: ${JSON.stringify(cookie)}`).toBe(400);
      expect(decryptPayload(vectors.secret, await readJson(response))).toMatchObject({
        success: false,
        message: "Invalid cookie format",
      });
    }
  });
});
