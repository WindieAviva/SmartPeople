const API_URL =
  "https://script.google.com/macros/s/AKfycbxMjctq9cXGr-1ieStWePa1OtEgPABO-YzG3J4KLfAYV1lKfBOo36Nl6DHYQYURvHWftw/exec";

export function getData(table: string): Promise<any[]> {
  return new Promise((resolve, reject) => {

    const callbackName =
      "smartPeopleCallback_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 10000);

    const script = document.createElement("script");

    const url =
      `${API_URL}?table=${encodeURIComponent(table)}` +
      `&callback=${callbackName}`;

    console.log("Mengambil data dari:", url);

    (window as any)[callbackName] = (result: any) => {

      console.log("Response dari Google Sheets:", result);

      delete (window as any)[callbackName];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      if (!result || !result.success) {
        reject(
          new Error(
            result?.message ||
            "Terjadi kesalahan pada Google Apps Script"
          )
        );
        return;
      }

      resolve(result.data);
    };

    script.src = url;
    script.async = true;

    script.onerror = (error) => {

      console.error(
        "JSONP gagal dimuat:",
        error
      );

      delete (window as any)[callbackName];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      reject(
        new Error(
          "Gagal menghubungi Google Apps Script"
        )
      );
    };

    document.body.appendChild(script);
  });
}