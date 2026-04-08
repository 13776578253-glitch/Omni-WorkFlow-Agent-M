# import io, logging
# import whisper
# import librosa
# import numpy as np
# from resemblyzer import VoiceEncoder
# from resemblyzer import preprocess_wav
# from sklearn.cluster import AgglomerativeClustering
# from sklearn.preprocessing import normalize
# from typing import Optional

# class Whisper:
#     logger = logging.getLogger("audio_functions")
#     _model: Optional[whisper.Whisper] = None
#     PROMPT = "请识别这段语音"
#     MODEL_PATH = "/app/app/functions/whisper_models"
#     MODEL_SIZE = "medium"
#     SAMPLE_RATE = 16000
    
#     # 首次调用时加载模型
#     @classmethod
#     def _get_model(cls):
#         if cls._model is None:
#             try:
#                 cls._model = whisper.load_model(
#                     cls.MODEL_SIZE,
#                     download_root=cls.MODEL_PATH
#                 )
#                 cls.logger.info(f"模型{cls.MODEL_SIZE}加载成功")
#             except Exception as e:
#                 cls.logger.error(f"{e}")
#                 raise RuntimeError(f"模型加载失败：{e}")
#         return cls._model

#     # 读取文件
#     @classmethod
#     def read_file(cls, audio_file_path):
#         with open(audio_file_path, "rb") as f:
#             audio_bytes = f.read()
#         return audio_bytes

#     # 将音频数据转换为Bytes格式
#     @classmethod
#     def get_audio(cls, audio_bytes):
#         audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
#         return audio, sr

#     # whisper语音转写
#     @classmethod
#     def audio_transcribe(cls, audio, language='zh', fp16=False, verbose=False, temperature=0.0):
#         model = cls._get_model()
#         result = model.transcribe(
#             audio,
#             language=language,  # 强制指定语言
#             fp16=fp16,     # CPU运行设置
#             verbose=verbose,   # 打印识别过程
#             initial_prompt=cls.PROMPT,  # 提示词
#             temperature=temperature # 温度值（越低越精准，越高越灵活）
#         )

#         cls.logger.info("转写音频成功")
#         return result
    

# class SpeakerClustering:
#     logger = logging.getLogger("audio_functions")

#     # Resemblyzer提取声纹
#     @classmethod
#     def extract_voiceprint(cls, segments, audio, sr):
#         encoder = VoiceEncoder()
#         embeddings = []

#         for seg in segments:
#             start = int(seg["start"] * sr)
#             end = int(seg["end"] * sr)
#             wav_slice = audio[start:end]
#             emb = encoder.embed_utterance(wav_slice)
#             embeddings.append(emb)

#         cls.logger.info("提取声纹成功")
#         return embeddings
    
#     # 说话人聚类
#     @classmethod
#     def cluster_speakers(cls, emb, n_clusters=None, distance_threshold=0.6, metric="cosine", linkage="average"):
#         embeddings = normalize(emb)

#         if len(embeddings) < 2:
#             labels = [0] * len(embeddings)
#         else:
#             cluster = AgglomerativeClustering(
#                 n_clusters=n_clusters,
#                 distance_threshold=distance_threshold,
#                 metric=metric,
#                 linkage=linkage
#             )
#             labels = cluster.fit_predict(embeddings)

#         cls.logger.info("聚类成功")
#         return labels
    
#     # 把speaker标签加入transcript
#     @classmethod 
#     def add_speaker(cls, segments, labels):
#         for i, seg in enumerate(segments):
#             seg["speaker"] = f"Speaker_{labels[i]}"

#         cls.logger.info("标签加入成功")
#         return segments
    

# class AudioFunctions:
#     logger = logging.getLogger("audio_functions")

#     # 说话人语音活动整合
#     @classmethod
#     def segments_integration(cls, segments):
#         result = []
#         for seg in segments:
#             start = round(seg["start"],2)
#             end = round(seg["end"],2)
#             result.append(f"[{start}-{end}] {seg['speaker']}: {seg['text']}")
#         return result
    
#     @classmethod
#     def get_audio_by_path(cls, audio_file_path):
#         audio_bytes = Whisper.read_file(audio_file_path)
#         audio, sr = Whisper.get_audio(audio_bytes)
#         result = Whisper.audio_transcribe(audio) # [120*16000:150*16000]

#         segments = result["segments"]
#         embeddings = SpeakerClustering.extract_voiceprint(segments, audio, sr)
#         labels = SpeakerClustering.cluster_speakers(embeddings)
#         audio_with_speaker = SpeakerClustering.add_speaker(segments, labels)

#         final_audio = cls.segments_integration(audio_with_speaker)
#         cls.logger.info("已完成音频处理")
#         return final_audio
            


# if __name__ == "__main__":
#     audio_file_path = "/app/app/things/test2.wav"
#     result = AudioFunctions.get_audio_by_path(audio_file_path)
#     print(result)
    







# import io, logging
# import whisper
# import librosa
# import numpy as np
# from resemblyzer import VoiceEncoder
# from resemblyzer import preprocess_wav
# from sklearn.cluster import AgglomerativeClustering
# from sklearn.preprocessing import normalize
# from typing import Optional

# class Whisper:
#     logger = logging.getLogger("audio_functions")
#     _model: Optional[whisper.Whisper] = None
#     PROMPT = "请识别这段语音"
#     MODEL_PATH = "/app/app/functions/whisper_models"
#     MODEL_SIZE = "medium"
#     SAMPLE_RATE = 16000
#     WINDOW = 5
    
#     # 首次调用时加载模型
#     @classmethod
#     def _get_model(cls):
#         if cls._model is None:
#             try:
#                 cls._model = whisper.load_model(
#                     cls.MODEL_SIZE,
#                     download_root=cls.MODEL_PATH
#                 )
#                 cls.logger.info(f"模型{cls.MODEL_SIZE}加载成功")
#             except Exception as e:
#                 cls.logger.error(f"{e}")
#                 raise RuntimeError(f"模型加载失败：{e}")
#         return cls._model

#     # 读取文件
#     @classmethod
#     def read_file(cls, audio_file_path):
#         with open(audio_file_path, "rb") as f:
#             audio_bytes = f.read()
#         return audio_bytes

#     # 将音频数据转换为数组
#     @classmethod
#     def get_audio(cls, audio_bytes):
#         audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
#         return audio, sr
    
#     # 新增：按固定窗口切分音频
#     @classmethod
#     def split_audio(cls, audio, sr):
#         audio_slices = []
#         total_length = len(audio)
#         window_samples = int(cls.WINDOW * sr)

#         for start_idx in range(0, total_length, window_samples):
#             end_idx = min(start_idx + window_samples, total_length)
#             start_time = start_idx / sr
#             end_time = end_idx / sr
#             audio_slices.append((start_time, end_time, audio[start_idx:end_idx]))

#         cls.logger.info("音频切分成功")
#         return audio_slices

#     # whisper语音转写
#     @classmethod
#     def audio_transcribe(cls, audio_slices, language='zh', fp16=False, verbose=False, temperature=0.0):
#         model = cls._get_model()
#         result_segments = []

#         # 对每段进行转写
#         for start_time, end_time, audio_slice in audio_slices:
#             result = model.transcribe(
#                 audio_slice,
#                 language=language, # 强制指定语言
#                 fp16=fp16, # CPU运行设置
#                 verbose=verbose, # 打印识别过程
#                 initial_prompt=cls.PROMPT, # 提示词
#                 temperature=temperature # 温度值（越低越精准，越高越灵活）
#             )
#             # Whisper返回的segment中有start/end相对当前片段，这里需要偏移
#             for seg in result['segments']:
#                 seg_start = seg['start'] + start_time
#                 seg_end = seg['end'] + start_time
#                 result_segments.append({
#                     'start': seg_start,
#                     'end': seg_end,
#                     'text': seg['text']
#                 })

#         cls.logger.info("转写音频成功")
#         return result
    

# class SpeakerClustering:
#     logger = logging.getLogger("audio_functions")

#     # Resemblyzer提取声纹
#     @classmethod
#     def extract_voiceprint(cls, segments, audio, sr):
#         encoder = VoiceEncoder()
#         embeddings = []

#         for seg in segments:
#             start = int(seg["start"] * sr)
#             end = int(seg["end"] * sr)
#             wav_slice = audio[start:end]
#             emb = encoder.embed_utterance(wav_slice)
#             embeddings.append(emb)

#         cls.logger.info("提取声纹成功")
#         return embeddings
    
#     # 说话人聚类
#     @classmethod
#     def cluster_speakers(cls, emb, n_clusters=None, distance_threshold=0.6, metric="cosine", linkage="average"):
#         embeddings = normalize(emb)

#         cluster = AgglomerativeClustering(
#             n_clusters=n_clusters,
#             distance_threshold=distance_threshold,
#             metric=metric,
#             linkage=linkage
#         )

#         if len(embeddings) < 2:
#             labels = [0] * len(embeddings)
#         else:
#             labels = cluster.fit_predict(embeddings)
#         # labels = cluster.fit_predict(embeddings)

#         cls.logger.info("聚类成功")
#         return labels
    
#     # 把speaker标签加入transcript
#     @classmethod 
#     def add_speaker(cls, segments, labels):
#         for i, seg in enumerate(segments):
#             seg["speaker"] = f"Speaker_{labels[i]}"

#         cls.logger.info("标签加入成功")
#         return segments
    

# class AudioFunctions:
#     logger = logging.getLogger("audio_functions")

#     # 说话人语音活动整合
#     @classmethod
#     def segments_integration(cls, segments):
#         result = []
#         for seg in segments:
#             start = round(seg["start"],2)
#             end = round(seg["end"],2)
#             result.append(f"[{start}-{end}] {seg['speaker']}: {seg['text']}")
#         return result
    
#     @classmethod
#     def get_audio_by_path(cls, audio_file_path):
#         audio_bytes = Whisper.read_file(audio_file_path)
#         audio, sr = Whisper.get_audio(audio_bytes)
#         audio_slices = Whisper.split_audio(audio, sr)
#         print(audio_slices, audio, sr)
#         result = Whisper.audio_transcribe(audio_slices) # [120*16000:150*16000]

#         segments = result["segments"]
#         embeddings = SpeakerClustering.extract_voiceprint(segments, audio, sr)
#         labels = SpeakerClustering.cluster_speakers(embeddings)
#         audio_with_speaker = SpeakerClustering.add_speaker(segments, labels)

#         final_audio = cls.segments_integration(audio_with_speaker)
#         cls.logger.info("已完成音频处理")
#         return final_audio
            


# if __name__ == "__main__":
#     audio_file_path = "/app/app/things/test2.wav"
#     result = AudioFunctions.get_audio_by_path(audio_file_path)
#     print(result)
    