# Node.js proxy server for servers returning 403 instead of 404

This Node.js script sets up a local proxy server that forwards HTTP requests to the remote server, replacing any `403` response codes with `404`.

If you store your debug info in an AWS S3 bucket with the "ListBucket" permission disabled, it is important to note that the server will return a `403` error for files that do not exist. This can cause issues with tools like `symchk` and `Visual Studio`, which check for `.pdb` files and attempt to retrieve `.pd_` files if the `.pdb` file is not found.

If the server returns a `404` error for a missing `.pdb` file, these tools will attempt to retrieve the `.pd_` file, which is a compressed version of the `.pdb` file. However, if the server returns a `403` error, these tools will skip the request for the `.pd_` file and may not be able to correctly load the necessary debugging information.

To avoid this issue, ensure that your AWS S3 bucket has the necessary permissions to allow access to the `.pdb` files and to return a `404` error for missing files, rather than a `403` error. This will ensure that tools like `symchk` and `Visual Studio` can correctly retrieve the necessary debugging information.

## Installation

To install this script, you'll need to have Node.js and Yarn installed on your machine.

1. Clone this repository to your local machine.
2. Navigate to the root directory of the repository in your terminal.
3. Run `yarn install` to install the required dependencies.

## Usage

To start the proxy server, run the following command in the root directory of the repository:

```yarn start https://yoursymbolsserver.com/symbols```

This will start the Node.js server on port `3000`. You can then send HTTP requests to `http://localhost:3000` to have them forwarded to the debug symbols storage server.

## Using with custom port and server

Or you can provide port and server url when starting a proxy.

```yarn start https://yoursymbolsserver.com/symbols 4000```

## Using with Visual Studio

To use this proxy server with `Visual Studio`, follow these steps:

1. Open your Visual Studio project and go to **Tools** > **Options** > **Debugging** > **Symbols**.
2. Add a new symbol file location with the following settings:
   - **Symbol file location:** `http://localhost:3000/symbols`
3. Click **OK** to save the settings.

`Visual Studio` will now download symbols from the local proxy server when debugging your project.

## Testing with symchk

To test the local proxy server with `symchk`, follow these steps:

1. Get a path to a binary what you want to debug with debug symbols on your server.
2. Open a command prompt and navigate to the directory where you have `symchk` installed. Usually `C:\Program Files (x86)\Windows Kits\10\Debuggers\x64`.
3. Run the following command, replacing `<path to binary>` with the path to your file and `c:\some_temp` with some temp directory:

```symchk /vvvv "<path to binary>" /s srv*c:\some_temp*http://localhost:3000/symbols```

4. If the local proxy server is running and working correctly, `symchk` should download the symbols successfully and finish output the following message:

```
SYMCHK: FAILED files = 0
SYMCHK: PASSED + IGNORED files = 1
```
