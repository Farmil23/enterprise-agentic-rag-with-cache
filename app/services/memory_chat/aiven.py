import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

# We use SqliteSaver to persist the conversational state locally so it survives restarts.
# The 'checkpoints.db' file will be created automatically in the root directory.
conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
checkpointer = SqliteSaver(conn)
