import { DataWritten as DataWrittenEvent } from "../generated/EventStore/EventStore";
import { DataWritten } from "../generated/schema";

export function handleDataWritten(event: DataWrittenEvent): void {
  const entity = new DataWritten(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.writer = event.params.writer;
  entity.keyHash = event.params.keyHash;
  entity.key = event.params.key;
  entity.value = event.params.value;
  entity.timestamp = event.params.timestamp;
  entity.blockNumber = event.block.number;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
