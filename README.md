# Async RPC Communication with RBMQ in NodeJS

This is an implementation of async RPC communication in NodeJS between a client and a server 
using RBMQ and AMQP.

The example use has a client ask for the fibonacci of a given number to the server. The server then
calculates fib(n) and returns the value. The client waits until all its requests have been completed.

The lib itself is described at ```rpc/amqplib.js ```

## Running
To test the example, run the server in a terminal and in another run the client

### Running the server
  ``` node server.js ```
 
### Running the client
  ``` node client.js <num1> ... <numN> ```
  #### Example
   ``` node client.js 10 20 30 ```
