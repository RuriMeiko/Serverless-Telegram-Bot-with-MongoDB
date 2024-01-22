class MongodbError extends Error {
	status: any;
	title: any;
	meta!: { link: any };
	constructor({ error, error_code, link }: any, status: any = 500) {
		super(error);
		this.name = "MongodbError";
		this.status = status;
		if (error_code) this.title = error_code;
		if (link) this.meta = { link };
	}
}

export default class MongoDB {
	private apiUrl: string;
	private apiKey: string;
	private dataSource: any;
	private currentDatabase: string | null = null;
	private currentCollection: string | null = null;
	private interpose: any;

	constructor({
		apiKey,
		apiUrl,
		dataSource,
	}: {
		apiKey: string;
		apiUrl: string;
		dataSource: any;
	}) {
		if (!apiUrl || !apiKey)
			throw new MongodbError("The `apiUrl` and `apiKey` must always be set.");

		this.apiUrl = apiUrl;
		this.apiKey = apiKey;
		this.dataSource = dataSource;
		this.interpose = (passThrough: any) => passThrough;
	}

	db(database: string): MongoDB {
		this.currentDatabase = database;
		return this;
	}

	collection(collection: string): MongoDB {
		this.currentCollection = collection;
		return this;
	}

	private makeAndAssertConnectionIsValid() {
		if (!this.dataSource || !this.currentDatabase || !this.currentCollection) {
			throw new MongodbError(
				"Database and collection must be set before calling this method."
			);
		}

		return {
			dataSource: this.dataSource,
			database: this.currentDatabase,
			collection: this.currentCollection,
		};
	}

	private async request(name: any, parameters: any) {
		const { body } = this.interpose({
			name,
			body: {
				...(parameters || {}),
				...this.makeAndAssertConnectionIsValid(),
			},
		});
		const response: any = await fetch(this.apiUrl + "/action/" + name, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"access-control-request-headers": "*",
				"api-key": this.apiKey,
			},
			body: JSON.stringify(body),
		});
		const status = response.status || response.statusCode || 500;

		if (status === 200 || status === 201) {
			return response.json();
		} else {
			// Errors that are at the Data API service level, for example authentication
			// and pathname validation, return a JSON error object. Errors that are at
			// the database level, for example errors returned from the `insertOne` call,
			// return a plaintext error string.
			let error = response.headers["content-type"]?.includes("application/json")
				? await response.json()
				: await response.text();

			if (typeof error === "string") {
				if (error.includes("{")) {
					try {
						error = JSON.parse(error);
					} catch (ignore) {
						// not valid JSON
						error = { error };
					}
				} else {
					// also not valid JSON, probably plaintext
					error = { error };
				}
			}

			return Promise.reject(new MongodbError(error, status));
		}
	}

	/**
	 * Runs an aggregation pipeline and returns the result set of the final stage of the pipeline
	 * as an array of documents.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.pipeline - The MongoDB pipeline array.
	 * @return {Promise<{ documents: Array<Object> }>} - The returned list of documents.
	 */
	aggregate = async ({ pipeline }: { pipeline: object }): Promise<{ documents: Array<any> }> =>
		this.request("aggregate", { pipeline });

	/**
	 * Delete the first document matching the filter, and return the number of documents deleted.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.filter - The MongoDB filter object.
	 * @return {Promise<{ deletedCount: Number }>} - The number of documents deleted.
	 */
	deleteOne = async ({ filter }: { filter: object }): Promise<{ deletedCount: number }> =>
		this.request("deleteOne", { filter });

	/**
	 * Delete all documents matching the filter, and return the number of documents deleted.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.filter - The MongoDB filter object.
	 * @return {Promise<{ deletedCount: Number }>} - The number of documents deleted.
	 */
	deleteMany = async ({ filter }: { filter: object }): Promise<{ deletedCount: number }> =>
		this.request("deleteMany", { filter });

	/**
	 * Find and return a list of documents.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} [parameters.filter] - The MongoDB filter object.
	 * @param {Object} [parameters.projection] - The MongoDB projection object.
	 * @param {Object} [parameters.sort] - The MongoDB sort object, e.g. `{ completed: -1 }`.
	 * @param {Number} [parameters.limit] - The maximum number of documents to return.
	 * @param {Number} [parameters.skip] - The number of documents to skip, aka the cursor position.
	 * @return {Promise<{ documents: Array<Object> }>} - The documents matching the parameters.
	 */
	find = async (
		{
			filter,
			projection,
			sort,
			limit,
			skip,
		}: {
			filter?: object;
			projection?: object;
			sort?: object;
			limit?: number;
			skip?: number;
		} = {
			filter: {},
			projection: {},
			sort: undefined,
			limit: undefined,
			skip: undefined,
		}
	): Promise<{ documents: Array<any> }> =>
		this.request("find", {
			filter,
			projection,
			sort,
			limit,
			skip,
		});

	/**
	 * Find and return the first document matching the filter.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} [parameters.filter] - The MongoDB filter object.
	 * @param {Object} [parameters.projection] - The MongoDB projection object.
	 * @return {Promise<{ document: Object }>} - The document matching the parameters.
	 */
	findOne = async (
		{ filter, projection }: { filter?: object; projection?: object } = {
			filter: {},
			projection: {},
		}
	): Promise<{ document: any }> =>
		this.request("findOne", {
			filter,
			projection,
		});

	/**
	 * Insert a single document. Must be an JSON document.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.document - The JSON document to insert.
	 * @return {Promise<{ insertedId: String }>} - The identifier of the inserted document.
	 */
	insertOne = async (document: object): Promise<{ insertedId: string }> =>
		this.request("insertOne", { document });

	/**
	 * Insert multiple documents at once. Must be JSON documents.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.documents - The JSON documents to insert.
	 * @return {Promise<{ insertedIds: Array<String> }>} - The identifiers of the inserted document.
	 */
	insertMany = async (documents: object): Promise<{ insertedIds: Array<string> }> =>
		this.request("insertMany", { documents });

	/**
	 * Replace or upsert a single document. Must be an JSON document.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.filter - The MongoDB filter object.
	 * @param {Object} parameters.replacement - The JSON document to replace or upsert.
	 * @param {Boolean} [parameters.upsert] - If set to true, it will insert the `replacement` document if no documents match the `filter`.
	 * @return {Promise<{ matchedCount: Number, modifiedCount: Number, upsertedId: String }>} - The request results.
	 */
	replaceOne = async ({
		filter,
		replacement,
		upsert,
	}: {
		filter: object;
		replacement: object;
		upsert?: boolean;
	}): Promise<{ matchedCount: number; modifiedCount: number; upsertedId: string }> =>
		this.request("replaceOne", {
			filter,
			replacement,
			upsert,
		});

	/**
	 * Update or upsert a single document. Must be an JSON document.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.filter - The MongoDB filter object.
	 * @param {Object} parameters.update - The JSON document to update or upsert.
	 * @param {Boolean} [parameters.upsert] - If set to true, it will insert the `replacement` document if no documents match the `filter`.
	 * @return {Promise<{ matchedCount: Number, modifiedCount: Number, upsertedId: String }>} - The request results.
	 */
	updateOne = async ({
		filter,
		update,
		upsert,
	}: {
		filter: object;
		update: object;
		upsert?: boolean;
	}): Promise<{ matchedCount: number; modifiedCount: number; upsertedId: string }> =>
		this.request("updateOne", {
			filter,
			update,
			upsert,
		});

	/**
	 * Update many documents or upsert a single document. Must be an JSON document.
	 * @param {Object} parameters - The request parameters.
	 * @param {Object} parameters.filter - The MongoDB filter object.
	 * @param {Object} parameters.update - The JSON document to update or upsert.
	 * @param {Boolean} [parameters.upsert] - If set to true, it will insert the `replacement` document if no documents match the `filter`.
	 * @return {Promise<{ matchedCount: Number, modifiedCount: Number, upsertedId: String }>} - The request results.
	 */
	updateMany = async ({
		filter,
		update,
		upsert,
	}: {
		filter: object;
		update: object;
		upsert?: boolean;
	}): Promise<{ matchedCount: number; modifiedCount: number; upsertedId: string }> =>
		this.request("updateMany", {
			filter,
			update,
			upsert,
		});
}
