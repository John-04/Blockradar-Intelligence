from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    # Identity
    id = Column(String, primary_key=True, index=True)        # Blockradar address ID
    fintech_id = Column(String, index=True, nullable=False)  # which fintech owns it
    fintech_name = Column(String, nullable=True)

    # Wallet details
    address = Column(String, unique=True, nullable=True)     # on-chain address
    network = Column(String, nullable=True)                  # e.g. ethereum, tron
    currency = Column(String, nullable=True)                 # USDC, USDT, PYUSD
    label = Column(String, nullable=True)

    # Balances
    balance_usd = Column(Float, default=0.0)
    total_received_usd = Column(Float, default=0.0)
    total_sent_usd = Column(Float, default=0.0)

    # Activity signals
    total_transactions = Column(Integer, default=0)
    last_active = Column(DateTime, nullable=True)
    is_dormant = Column(Boolean, default=False)              # no tx in 60+ days
    days_since_last_tx = Column(Integer, nullable=True)

    # Region info
    region = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=True)

    # Record tracking
    ingested_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self):
        return f"<Wallet {self.id} | {self.fintech_name} | dormant={self.is_dormant}>"