# The Indexer

This Go service collects and stores all the information available from the Droplet contract. It is intended to be run on a schedule (example, every hour).

## How it works

1. Check if there has been new transactions against the Droplet modified CW20 contract
2. If so, it grabs the raw contract state, parses it and stores the information for each address
3. It clears out the leaderboard, inserts the current state and ranks every address
4. Repeat

Parts of this service was generated using AI as an experiment. Improvements are welcome!

## Running locally

**Installation**

You'll need a working Go installation

```shell
make dependencies
```

**Run the local instance**

```shell
make run
```

**Help**

```shell
make help
```

## Build

Build the binary and place it in `./bin`

```shell
make build
```