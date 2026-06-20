package com.example.BookVerse.Mapper;

import com.example.BookVerse.Repository.Entity.Club;
import com.example.BookVerse.dto.ClubDTO;
import org.springframework.stereotype.Component;

@Component
public class ClubMapper {
    public ClubDTO.saveClubDto toClubDTO(Club club){
        return new ClubDTO.saveClubDto(
                club.getName(),
                club.getDescription(),
                club.isPrivate()
        );
    }

    public ClubDTO.ListClubDto toListClubDTO(Club club){
        return new ClubDTO.ListClubDto(
                club.getName(),
                club.getDescription(),
                club.isPrivate()
        );
    }

}
