from typing import TypedDict, Annotated, List
import operator
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class AgentState(TypedDict):
    final_answer: str

def n1(state: AgentState):
    # Do not return final_answer, so it should retain the value from input
    return {}

workflow = StateGraph(AgentState)
workflow.add_node("n1", n1)
workflow.set_entry_point("n1")
workflow.add_edge("n1", END)

app = workflow.compile(checkpointer=MemorySaver())

config = {"configurable": {"thread_id": "1"}}

# Run 1: Set a value
app.update_state(config, {"final_answer": "Old Value"})
print("State before Run 2:", app.get_state(config).values)

# Run 2: Pass empty string
out2 = app.invoke({"final_answer": ""}, config=config)
print("Run 2 Output:", out2)
