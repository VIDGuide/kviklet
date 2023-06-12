package com.example.executiongate.controller

import com.example.executiongate.security.UserDetailsWithId
import com.example.executiongate.service.ExecutionRequestService
import com.example.executiongate.service.QueryResult
import com.example.executiongate.service.dto.DatasourceConnectionId
import com.example.executiongate.service.dto.Event
import com.example.executiongate.service.dto.ExecutionRequest
import com.example.executiongate.service.dto.ExecutionRequestDetails
import com.example.executiongate.service.dto.ExecutionRequestId
import com.example.executiongate.service.dto.ReviewAction
import com.example.executiongate.service.dto.ReviewStatus
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime
import javax.validation.Valid

data class CreateExecutionRequest(
    val datasourceConnectionId: DatasourceConnectionId,
    val title: String,
    val description: String?,
    val statement: String,
    val readOnly: Boolean,
)

data class CreateReviewRequest(
    val comment: String,
    val action: ReviewAction,
)

data class CreateCommentRequest(
    val comment: String,
)

/**
 * A DTO for the {@link com.example.executiongate.db.ExecutionRequestEntity} entity
 */
data class ExecutionRequestResponse(
    val id: ExecutionRequestId,
    val title: String,
    val author: UserResponse,
    val description: String?,
    val statement: String,
    val readOnly: Boolean,
    val reviewStatus: ReviewStatus,
    val executionStatus: String,
    val createdAt: LocalDateTime = LocalDateTime.now()
) {

    companion object {
        fun fromDto(dto: ExecutionRequest): ExecutionRequestResponse {
            val userResponse = UserResponse(dto.author)
            return ExecutionRequestResponse(
                id = dto.id,
                author = userResponse,
                title = dto.title,
                description = dto.description,
                statement = dto.statement,
                readOnly = dto.readOnly,
                reviewStatus = dto.reviewStatus,
                executionStatus = dto.executionStatus,
                createdAt = dto.createdAt,
            )
        }
    }
}

/**
 * A DTO for the {@link com.example.executiongate.db.ExecutionRequestEntity} entity
 */
data class ExecutionRequestDetailResponse(
    val id: ExecutionRequestId,
    val author: UserResponse,
    val title: String,
    val description: String?,
    val statement: String,
    val readOnly: Boolean,
    val reviewStatus: ReviewStatus,
    val executionStatus: String,
    val events: List<Event>,
    val createdAt: LocalDateTime = LocalDateTime.now()
) {

    companion object {
        fun fromDto(dto: ExecutionRequestDetails) = ExecutionRequestDetailResponse(
            id = dto.request.id,
            author = UserResponse(dto.request.author),
            title = dto.request.title,
            description = dto.request.description,
            statement = dto.request.statement,
            readOnly = dto.request.readOnly,
            reviewStatus = dto.request.reviewStatus,
            executionStatus = dto.request.executionStatus,
            createdAt = dto.request.createdAt,
            events = dto.events.sortedBy { it.createdAt },
        )
    }
}

@RestController()
@Validated
@RequestMapping("/execution-requests")
@Tag(
    name = "Execution Requests",
    description = "Run queries against a datasource by interacting with Execution Requests"
)
class ExecutionRequestController(
    val executionRequestService: ExecutionRequestService
) {

    @PostMapping("/")
    fun create(
        @Valid @RequestBody request: CreateExecutionRequest,
        @AuthenticationPrincipal userDetails: UserDetailsWithId
    ): ExecutionRequestResponse {
        val executionRequest = executionRequestService.create(request, userDetails.id )
        return ExecutionRequestResponse.fromDto(executionRequest)
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: ExecutionRequestId): ExecutionRequestDetailResponse {
        return executionRequestService.get(id).let { ExecutionRequestDetailResponse.fromDto(it) }
    }

    @GetMapping
    fun list(): List<ExecutionRequestResponse> {
        return executionRequestService.list().map { ExecutionRequestResponse.fromDto(it) }
    }

    @PostMapping("/{id}/reviews")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    fun createReview(
        @PathVariable id: ExecutionRequestId,
        @Valid @RequestBody request: CreateReviewRequest
    ) {
        executionRequestService.createReview(id, request)
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    fun createComment(
        @PathVariable id: ExecutionRequestId,
        @Valid @RequestBody request: CreateCommentRequest
    ) {
        executionRequestService.createComment(id, request)
    }

//    @PostMapping("/{requestId}")
//    fun execute(@PathVariable requestId: String): QueryResult {
//        return executionRequestService.execute(requestId)
//    }
}