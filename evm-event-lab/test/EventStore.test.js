const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("EventStore", function () {
  it("emits the indexed key hash and payload", async function () {
    const [writer] = await ethers.getSigners();
    const store = await (await ethers.getContractFactory("EventStore")).deploy();
    await expect(store.writeData("course", "hello"))
      .to.emit(store, "DataWritten")
      .withArgs(writer.address, ethers.keccak256(ethers.toUtf8Bytes("course")), "course", "hello", anyValue);
  });
  it("rejects empty key and value", async function () {
    const store = await (await ethers.getContractFactory("EventStore")).deploy();
    await expect(store.writeData("", "value")).to.be.revertedWith("EventStore: empty key");
    await expect(store.writeData("key", "")).to.be.revertedWith("EventStore: empty value");
  });
});
