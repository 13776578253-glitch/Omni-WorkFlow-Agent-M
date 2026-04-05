from typing import Any, Literal, Optional

from pydantic import BaseModel


class WorkflowFileRef(BaseModel):
    url: Optional[str] = None
    path: Optional[str] = None
    mimeType: Optional[str] = None
    fileName: str


class WorkflowAttachment(BaseModel):
    id: str
    type: Literal["image", "file"]
    fileName: str
    fileSize: Optional[int] = None
    mimeType: Optional[str] = None
    localPath: Optional[str] = None
    thumbnailUri: Optional[str] = None
    fileRef: Optional[WorkflowFileRef] = None
    uploadStatus: Optional[Literal["pending", "uploading", "success", "error"]] = None
    uploadProgress: Optional[int] = None


class WorkflowBlock(BaseModel):
    id: str
    role: Literal["user", "ai"]
    content: str
    createdAt: int
    sourceBlockId: Optional[str] = None
    fileRef: Optional[WorkflowFileRef] = None
    attachments: Optional[list[WorkflowAttachment]] = None
    editedByUser: Optional[bool] = None
    originalLanguage: Optional[str] = None
    translatedContent: Optional[str] = None
    isTranslated: Optional[bool] = None
    source: Optional[str] = None
    hasSummary: Optional[bool] = None
    summaryContent: Optional[str] = None
    shouldGenerateSummary: Optional[bool] = None
    status: Optional[Literal["pending", "done", "error"]] = None
    thoughtChain: Optional[dict[str, Any]] = None
    thoughtChainAnimationPlayed: Optional[bool] = None
    messageAnimationPlayed: Optional[bool] = None


class WorkflowRecordedAudio(BaseModel):
    audioResourceId: Optional[str] = None
    audioUri: Optional[str] = None
    durationMs: int


class WorkflowSessionDetail(BaseModel):
    sessionId: str
    blocks: list[WorkflowBlock]
    lastModified: Optional[int] = None
    recordedAudio: Optional[WorkflowRecordedAudio] = None


class WorkflowInputRequest(BaseModel):
    text: Optional[str] = None
    fileRef: Optional[WorkflowFileRef] = None
    blocks: list[WorkflowBlock]
    sessionId: Optional[str] = None
    id: Optional[str] = None


class WorkflowGenerateRequest(BaseModel):
    blocks: list[WorkflowBlock]
    action: Literal["regenerate_from_first", "append_after"]
    afterBlockId: Optional[str] = None
    sessionId: Optional[str] = None
    id: Optional[str] = None


class WorkflowGenerateResponse(BaseModel):
    blockId: str
    content: str
    sourceBlockId: str
    status: Literal["done"]
    attachments: Optional[list[WorkflowAttachment]] = None


class WorkflowTranscriptRequest(BaseModel):
    audioUri: Optional[str] = None
    audioResourceId: Optional[str] = None
    sessionId: Optional[str] = None
    id: Optional[str] = None


class WorkflowTranscriptSegment(BaseModel):
    startTime: int
    endTime: int
    text: str


class WorkflowTranscriptResponse(BaseModel):
    segments: list[WorkflowTranscriptSegment]
    fullText: str


class WorkflowLongAudioTaskRequest(BaseModel):
    audioResourceId: str
    prompt: str
    durationMs: Optional[int] = None
    sessionId: Optional[str] = None
    id: Optional[str] = None


class WorkflowLongAudioTaskStatus(BaseModel):
    taskId: str
    status: Literal["pending", "processing", "completed", "failed"]
    sessionId: Optional[str] = None
    result: Optional[dict[str, Any]] = None
    errorMessage: Optional[str] = None
