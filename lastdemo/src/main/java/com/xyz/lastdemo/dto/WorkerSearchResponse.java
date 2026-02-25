package com.xyz.lastdemo.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerSearchResponse {
    private List<WorkerCardDTO> workers;
    private Long totalResults;
    private Integer currentPage;
    private Integer totalPages;
}
