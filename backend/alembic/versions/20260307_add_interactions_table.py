"""Add interactions table for US-003

Revision ID: 20260307_add_interactions
Revises: 
Create Date: 2026-03-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260307_add_interactions'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create interactions table
    op.create_table(
        'interactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('session_id', sa.String(50), sa.ForeignKey('sessions.id'), nullable=False, index=True),
        sa.Column('interaction_type', sa.String(20), nullable=False),  # 'initial', 'follow_up'
        sa.Column('question', sa.Text, nullable=False),
        sa.Column('question_category', sa.String(50), nullable=True),
        sa.Column('reading_id', sa.String(50), sa.ForeignKey('readings.id'), nullable=True),
        sa.Column('sequence_number', sa.Integer, nullable=False),
        sa.Column('context_summary', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    
    # Create index for session + sequence
    op.create_index('idx_session_seq', 'interactions', ['session_id', 'sequence_number'])
    
    # Add follow_up_count to sessions if not exists
    # (it already exists in the model, so this is just in case)
    try:
        op.add_column('sessions', sa.Column('follow_up_count', sa.Integer, server_default='0'))
    except:
        pass  # Column might already exist


def downgrade() -> None:
    # Drop interactions table
    op.drop_table('interactions')
    
    # Remove follow_up_count from sessions (optional)
    try:
        op.drop_column('sessions', 'follow_up_count')
    except:
        pass
