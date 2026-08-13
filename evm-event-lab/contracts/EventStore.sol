// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title EventStore
/// @notice Stores no application data; it writes queryable event logs.
contract EventStore {
    /// @notice Emitted whenever a caller publishes a key/value pair.
    event DataWritten(
        address indexed writer,
        bytes32 indexed keyHash,
        string key,
        string value,
        uint256 timestamp
    );

    /// @notice Publishes a key/value pair as an indexed event.
    /// @param key Human-readable key; must not be empty.
    /// @param value Human-readable value; must not be empty.
    function writeData(string calldata key, string calldata value) external {
        require(bytes(key).length != 0, "EventStore: empty key");
        require(bytes(value).length != 0, "EventStore: empty value");
        emit DataWritten(msg.sender, keccak256(bytes(key)), key, value, block.timestamp);
    }
}
