from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    # Identity
    id = Column(String, primary_key=True, index=True)        # Blockradar tx ID
    wallet_id = Column(String, index=True, nullable=False)   # which wallet
    fintech_id = Column(String, index=True, nullable=False)  # which fintech

    # Transaction details
    tx_hash = Column(String, nullable=True)                  # on-chain hash
    type = Column(String, nullable=True)                     # deposit, withdrawal, transfer
    status = Column(String, nullable=True)                   # success, failed, pending
    network = Column(String, nullable=True)
    currency = Column(String, nullable=True)

    # Amounts
    amount = Column(Float, default=0.0)
    amount_usd = Column(Float, default=0.0)
    fee_usd = Column(Float, default=0.0)

    # Addresses
    from_address = Column(String, nullable=True)
    to_address = Column(String, nullable=True)

    # Metadata
    region = Column(String, nullable=True)
    note = Column(Text, nullable=True)

    # Timestamps
    tx_date = Column(DateTime, nullable=True, index=True)    # when it happened on-chain
    ingested_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Transaction {self.id} | {self.type} | ${self.amount_usd} | {self.status}>"