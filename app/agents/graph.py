from langgraph.graph import StateGraph, END
from app.services.memory_chat.aiven import checkpointer
from app.agents.state import AgentState
from app.agents.nodes.planner import planner_node
from app.agents.nodes.retriever import retrieve_node
from app.agents.nodes.responder import generate_node
from app.agents.nodes.cache_checker import cache_node
from app.agents.nodes.cache_saver import save_cache_node
from app.agents.nodes.contextualizer_node import contextualizer_node
from app.agents.nodes.guardrail import guardrail_node

# 1. Initialize the State Graph
workflow = StateGraph(AgentState)


# 2. Define the Nodes
workflow.add_node("planner", planner_node)
workflow.add_node("retriever", retrieve_node)
workflow.add_node("responder", generate_node)

# EKS -- Done
workflow.add_node("cache_checker", cache_node )
workflow.add_node("cache_saver", save_cache_node)

# EKS 
workflow.add_node("query_context", contextualizer_node)

# Guardrail
workflow.add_node("guardrail", guardrail_node)

# 3. Define the Edges & Routing Logic
def route_planner(state: AgentState):
    """
    Routes the workflow based on the planner's decision.
    """
    if state["current_query"] == "CONVERSATIONAL":
        return "responder"
    return "retriever"

# Route untuk setelah cache, jika hit END, jika tidak ke planner
def route_after_cache(state: AgentState):
    if state.get("cache_hit"):
        return "end"
    return "planner"
        
def route_guardrail(state: AgentState):
    if not state.get("is_safe"):
        return "end"
    

    if state.get("final_answer"):
        return "end"
        
    return "query_context"

workflow.set_entry_point("guardrail")

workflow.add_conditional_edges(
    "guardrail",
    route_guardrail,
    {
        "query_context": "query_context",
        "end": END
    }
)

workflow.add_edge("query_context" , "cache_checker")

workflow.add_conditional_edges(
    "cache_checker",
    route_after_cache,
    {
        "end" : END,
        "planner" : "planner"
    }
)

# Conditional Edge: Planner -> Router -> (Retriever OR Responder)
workflow.add_conditional_edges(
    "planner",
    route_planner,
    {
        "retriever": "retriever",
        "responder": "responder"
    }
)


workflow.add_edge("retriever", "responder")
workflow.add_edge("responder", "cache_saver")
workflow.add_edge("cache_saver", END)


rag_agent = workflow.compile(checkpointer=checkpointer)
