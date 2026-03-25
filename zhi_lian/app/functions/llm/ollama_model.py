from langchain_community.chat_models import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

class GeminiModel:
    def __init__(self, model="gemma3", temperature=0.7):
        self.llm = ChatOllama(
            model=model, 
            base_url="http://host.docker.internal:11434",
            temperature=temperature
        )
        # 存储对话历史
        self.chat_history = []

    def question(self, s_msg, h_msg):
        system_msg = SystemMessage(content=s_msg)
        human_msg = HumanMessage(content=h_msg)
        
        # 保存用户消息到历史
        self.chat_history.append(("用户", h_msg))
        # 调用模型
        result = self.llm.invoke([system_msg, human_msg])
        # 保存AI回复到历史
        self.chat_history.append(("AI", result.content))
        
        return result

    def display_chat(self):
        """显示完整对话历史"""
        print("===== 对话历史 =====")
        for sender, content in self.chat_history:
            print(f"{sender}: {content}\n")
        print("====================")


def main():
    a = GeminiModel()
    p0 = '你是一个日常谈话小助手，注意：你会以markdown的形式回答'
    s_msg = p0
    h_msg = '帮我生成一个关于新手该怎么入门react的ppt'
    b = a.question(s_msg, h_msg)
    print(b.content)


if __name__ == "__main__":
    main()