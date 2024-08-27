import { useState } from "react";
import axios from "axios";
import Xbimviewer from "./Xbimviewer";

function FileUpload() {
    const [file, setFile] = useState(null); // State to store the uploaded file
    const [convertedFileUrl, setConvertedFileUrl] = useState(null); // State to store the converted file URL
    const [fileName, setFileName] = useState(""); // State to store the file name
    const [error, setError] = useState(""); // State to store error messages

    // Handle file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setError(""); // Clear previous error messages
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Make a POST request to the backend API
            const response = await axios.post(
                "http://127.0.0.1:5084/api/bimconversion/convert",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            // console.log('response', response.data);

            // Extract file name and file URL from response
            // const { fileName, fileWithPath } = response.data;
            const { fileName } = response.data;

            // If the file is publicly accessible, replace `fileWithPath` with the URL to access it
            const url = `http://127.0.0.1:5084/api/bimconversion/files/${fileName}`;

            setConvertedFileUrl(url);
            setFileName(fileName);
            setError("");
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("Failed to upload and convert file. Please try again.");
        }
    };

    return (
        <div>
            <h2>Upload IFC File to Convert to WEXBIM</h2>
            <input type="file" accept=".ifc" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload and Convert</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Display converted file if available */}
            {convertedFileUrl && (
                <div>
                    <h3>Converted WEXBIM File: </h3> {fileName} 
                    {/* <a href={convertedFileUrl} download={fileName}>
                    Download WEXBIM File
                    </a> */}
                    {/* Pass the file URL and file name as props */}
                    <Xbimviewer  fileName={fileName} />
                </div>
            )}
        </div>
    );
}

export default FileUpload;
