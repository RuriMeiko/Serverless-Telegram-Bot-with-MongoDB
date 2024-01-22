export default class BingImageCreater {
	private _U: string;
	private SRCHHPGUSR: string;
	private sessionCookies: string[] = [];
	private BING_URL: string;
	constructor(_U: string, SRCHHPGUSR: string) {
		this._U = _U;
		this.SRCHHPGUSR = SRCHHPGUSR;
		this.sessionCookies.push(`_U=${this._U}`);
		this.sessionCookies.push(`SRCHHPGUSR=${this.SRCHHPGUSR}`);
		this.BING_URL = "https://www.bing.com";
	}
	private async makeSessionFetch(
		url: string,
		method: string = "GET",
		body: string | null = null
	) {
		const randomIpSegment = () => Math.floor(Math.random() * 256);

		const FORWARDED_IP: string = `13.${
			Math.floor(Math.random() * 4) + 104
		}.${randomIpSegment()}.${randomIpSegment()}`;

		const defaultOptions: any = {
			headers: {
				accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded",
				origin: "https://www.bing.com",
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
				Referer: url,
				"x-forwarded-for": FORWARDED_IP,
			},
			body: body,
			method: method,
		};

		// Thêm cookie vào header nếu có
		if (this.sessionCookies.length > 0) {
			defaultOptions.headers = {
				...defaultOptions.headers,
				cookie: this.sessionCookies.join("; "),
			};
		}

		// Gửi yêu cầu và trả về Response
		try {
			const response = await fetch(url, defaultOptions);
			// Kiểm tra trạng thái của phản hồi
			if (!response.ok) {
				throw new Error(`Network response was not ok: ${response.statusText}`);
			}
			//@ts-ignore
			const setCookieHeaders = response.headers.getAll("Set-Cookie");
			if (setCookieHeaders) {
				setCookieHeaders.forEach((setCookieHeader: string) => {
					const cookieKey = setCookieHeader.split(";")[0];
					const existingIndex = this.sessionCookies.findIndex((cookie) =>
						cookie.startsWith(cookieKey)
					);

					if (existingIndex !== -1) {
						// Nếu đã tồn tại cookie với khóa tương tự, thì đè lên cookie cũ
						this.sessionCookies[existingIndex] = setCookieHeader;
					} else {
						// Ngược lại, thêm cookie mới vào mảng
						this.sessionCookies.push(setCookieHeader);
					}
				});
			}

			return response;
		} catch (error) {
			console.error("Fetch error:", error);
			throw error; // Ném lại lỗi để có thể xử lý ở nơi gọi hàm
		}
	}
	async getImages(prompt: string) {
		console.log("Sending request...");
		const urlEncodedPrompt = encodeURIComponent(prompt);
		const error_mess = {
			error_blocked_prompt:
				"Your prompt has been blocked by Bing. Try to change any bad words and try again.",
			error_being_reviewed_prompt:
				"Your prompt is being reviewed by Bing. Try to change any sensitive words and try again.",
			error_noresults: "Could not get results",
			error_unsupported_lang: "\nthis language is currently not supported by bing",
		};
		let response: Response;
		const url = `${this.BING_URL}/images/create?q=${urlEncodedPrompt}&rt=4&FORM=GENCRE`;
		response = await this.makeSessionFetch(url, "POST", `q=${urlEncodedPrompt}&qs=ds`);
		if (response.status !== 302 && response.status !== 200) {
			console.error(`ERROR: the status is ${response.status} instead of 302 or 200`);
			const url = `${this.BING_URL}/images/create?q=${urlEncodedPrompt}&rt=3&FORM=GENCRE`;
			response = await this.makeSessionFetch(url, "POST", `q=${urlEncodedPrompt}&qs=ds`);
			throw new Error("Redirect failed");
		}
		let redirectUrl: string = response.url.replace("&nfy=1", "");
		const requestId = redirectUrl.split("id=")[1];

		await this.makeSessionFetch(redirectUrl);
		const pollingUrl = `${this.BING_URL}/images/create/async/results/${requestId}?q=${urlEncodedPrompt}`;
		const startWait = Date.now();
		let imagesResponse: Response;
		let dataResponse: any; // Kiểu dữ liệu này cần phải được xác định dựa trên nội dung thực tế của API
		while (true) {
			if (Date.now() - startWait > 1000 * 60 * 5) {
				throw new Error("Timeout error");
			}
			console.log(".", { end: "", flush: true });
			imagesResponse = await this.makeSessionFetch(pollingUrl);
			if (imagesResponse.status !== 200) {
				throw new Error("Could not get results");
			}
			const contentType = imagesResponse.headers.get("Content-Type");
			if (contentType && contentType.includes("application/json")) {
				dataResponse = await imagesResponse.json();
			} else {
				dataResponse = await imagesResponse.text();
			}
			if (!dataResponse) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				continue;
			} else {
				break;
			}
		}
		if (dataResponse.errorMessage === "Pending") {
			throw new Error(
				"This prompt has been blocked by Bing. Bing's system flagged this prompt because it may conflict with their content policy. More policy violations may lead to automatic suspension of your access."
			);
		} else if (dataResponse.errorMessage) {
			throw new Error("Bing returned an error: " + dataResponse.errorMessage);
		}
		const imageLinks = dataResponse
			.match(/src="([^"]+)"/g)
			.map((src: string) => src.slice(5, -1));
		const normalImageLinks: string[] = Array.from(
			new Set(imageLinks.map((link: string) => link.split("?w=")[0]))
		);

		const badImages = [
			"https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png",
			"https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg",
		];

		if (normalImageLinks.length === 0) {
			throw new Error("No images");
		}
		const validImageLinks: string[] = [];

		for (const im of normalImageLinks) {
			if (badImages.includes(im)) {
				throw new Error("Bad images");
			}
			if (!im.endsWith(".svg")) validImageLinks.push(im);
		}
		return validImageLinks;
	}
}
